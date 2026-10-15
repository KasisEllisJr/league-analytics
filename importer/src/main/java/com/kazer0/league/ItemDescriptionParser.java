package com.kazer0.league;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ItemDescriptionParser {

    private static final Pattern STATS_SECTION =
        Pattern.compile(
            "<stats>(.*?)</stats>",
            Pattern.DOTALL
        );

    private static final Pattern ABILITY_HASTE =
        Pattern.compile(
            "(\\d+(?:\\.\\d+)?)\\s*Ability Haste",
            Pattern.CASE_INSENSITIVE
        );

    public static Double extractAbilityHaste(
            String description
    ) {

        Matcher sectionMatcher =
            STATS_SECTION.matcher(description);

        if (!sectionMatcher.find()) {
            return null;
        }

        String statsSection =
            sectionMatcher.group(1);

        // Remove formatting tags
        String cleanedStats =
            statsSection.replaceAll("<[^>]+>", " ");

        Matcher hasteMatcher =
            ABILITY_HASTE.matcher(cleanedStats);

        if (hasteMatcher.find()) {
            return Double.parseDouble(
                hasteMatcher.group(1)
            );
        }

        return null;
    }
}