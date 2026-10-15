package com.kazer0.league;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class ChampionAttackDamageGrowthImporter {

    private static final String WIKI_URL =
        "https://wiki.leagueoflegends.com/en-us/"
        + "List_of_champions/Attack_damage";

    // Stop if the wiki returns only a small partial table.
    private static final int MIN_WIKI_RECORDS = 150;

    // Require at least 90% of CSV champions to match.
    private static final double MIN_MATCH_RATE = 0.90;

    public static void main(String[] args) throws Exception {

        if (args.length < 2 || args.length > 3) {
            System.out.println(
                "Usage: ChampionAttackDamageGrowthImporter "
                + "<input.csv> <output.csv> [saved-wiki.html]"
            );
            return;
        }

        Path input = Path.of(args[0]).toAbsolutePath().normalize();
        Path output = Path.of(args[1]).toAbsolutePath().normalize();

        if (!Files.exists(input)) {
            throw new IOException(
                "Input CSV not found: " + input
            );
        }

        if (input.equals(output)) {
            throw new IllegalArgumentException(
                "Input and output must be different files."
            );
        }

        if (Files.exists(output)) {
            throw new IOException(
                "Output already exists. Move or rename it first: "
                + output
            );
        }

        System.out.println("Loading champion growth data...");

        Document document;

        if (args.length == 3) {
            Path htmlFile = Path.of(args[2]);

            document = Jsoup.parse(
                htmlFile.toFile(),
                "UTF-8",
                WIKI_URL
            );

            System.out.println(
                "Using saved wiki HTML: " + htmlFile
            );

        } else {
            document = Jsoup.connect(WIKI_URL)
                .userAgent(
                    "Kazer0LeagueAnalytics/1.0 "
                    + "(educational data project)"
                )
                .timeout(30000)
                .get();

            System.out.println("Downloaded wiki HTML.");
        }

        Map<String, Double> growthByName =
            extractGrowthValues(document);

        System.out.println(
            "Wiki growth records: " + growthByName.size()
        );

        if (growthByName.size() < MIN_WIKI_RECORDS) {
            throw new IllegalStateException(
                "Too few wiki records. Expected at least "
                + MIN_WIKI_RECORDS
                + " but found " + growthByName.size()
                + ". The table may not have loaded correctly."
            );
        }

        mergeCsv(input, output, growthByName);

        System.out.println();
        System.out.println("Import completed successfully.");
        System.out.println("Created: " + output);
    }

    private static Map<String, Double> extractGrowthValues(
        Document document
    ) {
        Map<String, Double> growth = new HashMap<>();

        boolean foundAttackDamageTable = false;

        for (Element table : document.select("table")) {

            Elements rows = table.select("tr");

            int championColumn = -1;
            int growthColumn = -1;
            int headerRowIndex = -1;

            // Identify columns by their labels,
            // rather than assuming fixed positions.
            for (int i = 0; i < rows.size(); i++) {
                Elements cells =
                    rows.get(i).select("th, td");

                for (int col = 0; col < cells.size(); col++) {
                    String header = normalizeHeader(
                        cells.get(col).text()
                    );

                    if (header.equals("champion")
                            || header.equals("champions")) {
                        championColumn = col;
                    }

                    if (header.contains("growth")
                            && (header.contains("coefficient")
                                || header.equals("growth"))) {
                        growthColumn = col;
                    }
                }

                if (championColumn >= 0
                        && growthColumn >= 0) {
                    headerRowIndex = i;
                    break;
                }

                championColumn = -1;
                growthColumn = -1;
            }

            if (headerRowIndex < 0) {
                continue;
            }

            foundAttackDamageTable = true;

            for (int i = headerRowIndex + 1;
                    i < rows.size(); i++) {

                Elements cells = rows.get(i).select("td");

                if (cells.size()
                        <= Math.max(championColumn, growthColumn)) {
                    continue;
                }

                String championName =
                    cells.get(championColumn).text();

                String growthText =
                    cells.get(growthColumn).text();

                String name = normalizeName(championName);

                if (name.isBlank()) {
                    continue;
                }

                Double value = parseNumber(growthText);

                if (value == null) {
                    continue;
                }

                Double previous = growth.putIfAbsent(
                    name,
                    value
                );

                if (previous != null
                        && Double.compare(previous, value) != 0) {
                    throw new IllegalStateException(
                        "Conflicting growth values for "
                        + championName
                    );
                }
            }
        }

        if (!foundAttackDamageTable) {
            throw new IllegalStateException(
                "Could not find a table containing Champion "
                + "and Growth coefficient columns. "
                + "The wiki HTML structure may have changed."
            );
        }

        return growth;
    }

    private static void mergeCsv(
        Path input,
        Path output,
        Map<String, Double> growthByName
    ) throws IOException {

        try (
            Reader reader = Files.newBufferedReader(
                input,
                StandardCharsets.UTF_8
            );

            CSVParser parser = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreEmptyLines(true)
                .get()
                .parse(reader)
        ) {
            List<String> headers =
                new ArrayList<>(parser.getHeaderNames());

            int nameColumn = findColumn(
                headers,
                "champion_name",
                "championName",
                "champion",
                "name"
            );

            if (nameColumn < 0) {
                throw new IllegalStateException(
                    "No champion name column found. Headers: "
                    + headers
                );
            }

            int growthColumn = findColumn(
                headers,
                "attack_damage_growth",
                "attackDamageGrowth",
                "attackdamageperlevel",
                "attack_damage_per_level"
            );

            boolean addedColumn = growthColumn < 0;

            if (addedColumn) {
                growthColumn = headers.size();
                headers.add("attack_damage_growth");
            }

            List<List<String>> updatedRows =
                new ArrayList<>();

            Set<String> matchedNames = new HashSet<>();
            List<String> unmatchedNames = new ArrayList<>();

            int total = 0;
            int updated = 0;

            for (CSVRecord record : parser) {
                total++;

                List<String> fields =
                    new ArrayList<>(record.toList());

                while (fields.size() < headers.size()) {
                    fields.add("");
                }

                String championName =
                    fields.get(nameColumn);

                String normalized =
                    normalizeName(championName);

                Double value =
                    growthByName.get(normalized);

                if (value == null) {
                    unmatchedNames.add(championName);

                } else {
                    fields.set(
                        growthColumn,
                        Double.toString(value)
                    );

                    matchedNames.add(normalized);
                    updated++;
                }

                updatedRows.add(fields);
            }

            if (total == 0) {
                throw new IllegalStateException(
                    "Input CSV contains no champions."
                );
            }

            double matchRate = (double) updated / total;

            System.out.println();
            System.out.println("CSV champions: " + total);
            System.out.println("Matched: " + updated);
            System.out.println(
                "Match rate: "
                + String.format(
                    Locale.ROOT,
                    "%.1f%%",
                    matchRate * 100
                )
            );

            if (!unmatchedNames.isEmpty()) {
                System.out.println();
                System.out.println("Unmatched champions:");

                for (String name : unmatchedNames) {
                    System.out.println("  - " + name);
                }
            }

            if (matchRate < MIN_MATCH_RATE) {
                throw new IllegalStateException(
                    "Match rate below "
                    + (MIN_MATCH_RATE * 100)
                    + "%. Output was not written."
                );
            }

            Path parent = output.getParent();

            if (parent != null) {
                Files.createDirectories(parent);
            }

            try (
                Writer writer = Files.newBufferedWriter(
                    output,
                    StandardCharsets.UTF_8
                );

                CSVPrinter printer = new CSVPrinter(
                    writer,
                    CSVFormat.DEFAULT
                )
            ) {
                printer.printRecord(headers);

                for (List<String> row : updatedRows) {
                    printer.printRecord(row);
                }
            }

            System.out.println();
            System.out.println(
                "Attack Damage Growth updated for "
                + updated + " champions."
            );

            if (addedColumn) {
                System.out.println(
                    "Added column: attack_damage_growth"
                );
            } else {
                System.out.println(
                    "Updated existing growth column."
                );
            }
        }
    }

    private static int findColumn(
        List<String> headers,
        String... acceptedNames
    ) {
        List<String> allowed = Arrays.stream(acceptedNames)
            .map(
                ChampionAttackDamageGrowthImporter::
                    normalizeHeader
            )
            .toList();

        for (int i = 0; i < headers.size(); i++) {
            if (allowed.contains(
                    normalizeHeader(headers.get(i)))) {
                return i;
            }
        }

        return -1;
    }

    private static String normalizeHeader(String text) {
        return text.toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]", "");
    }

    private static String normalizeName(String text) {
        String name = Normalizer.normalize(
            text,
            Normalizer.Form.NFKD
        )
            .replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT)
            .replace("&", "and")
            .replaceAll("[^a-z0-9]", "");

        // Some wiki icon cells repeat the champion's name.
        // Example: "Ambessa Ambessa" -> "ambessa".
        if (name.length() % 2 == 0) {
            int midpoint = name.length() / 2;

            String first = name.substring(0, midpoint);
            String second = name.substring(midpoint);

            if (first.equals(second)) {
                name = first;
            }
        }

        // Data Dragon's internal champion identifier.
        if (name.equals("monkeyking")) {
            return "wukong";
        }

        // An occasional shortened name.
        if (name.equals("nunu")) {
            return "nunuandwillump";
        }

        return name;
    }

    private static Double parseNumber(String text) {
        String cleaned = text
            .replace('\u2212', '-')
            .replace(",", "")
            .replaceAll("[^0-9.+-]", "");

        if (cleaned.isBlank()) {
            return null;
        }

        try {
            double value = Double.parseDouble(cleaned);

            return Double.isFinite(value)
                ? value
                : null;

        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
