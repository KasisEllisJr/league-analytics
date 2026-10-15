package com.kazer0.league;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class DataDragonClient {

    private static final String VERSION = "16.20.1";

    private static final String BASE_URL =
        "https://ddragon.leagueoflegends.com/cdn/"
        + VERSION + "/data/en_US/";

    private static final HttpClient CLIENT =
        HttpClient.newHttpClient();

    public static String fetchChampions()
            throws Exception {
        return fetchData("champion.json");
    }

    public static String fetchItems()
            throws Exception {
        return fetchData("item.json");
    }

    private static String fetchData(String file)
            throws Exception {

        String url = BASE_URL + file;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();

        HttpResponse<String> response = CLIENT.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() != 200) {
            throw new IllegalStateException(
                "Data Dragon returned HTTP "
                + response.statusCode()
            );
        }

        return response.body();
    }
}