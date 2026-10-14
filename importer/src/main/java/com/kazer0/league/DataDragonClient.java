package com.kazer0.league;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class DataDragonClient {

    public static String fetchChampions()
            throws Exception {

        String url =
            "https://ddragon.leagueoflegends.com/cdn/"
            + "16.20.1/data/en_US/champion.json";

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        HttpResponse<String> response =
                client.send(
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