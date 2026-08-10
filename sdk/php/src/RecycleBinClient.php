<?php

namespace Crty\RecycleBin;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class RecycleBinClient
{
    private Client $client;
    private string $api;
    private string $siteId;
    private string $apiKey;

    public function __construct(string $api, string $siteId, string $apiKey = '')
    {
        $this->api = rtrim($api, '/');
        $this->siteId = $siteId;
        $this->apiKey = $apiKey;

        $this->client = new Client([
            'base_uri' => $this->api . '/',
            'headers' => $this->getHeaders(),
        ]);
    }

    private function getHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'X-Site-ID' => $this->siteId,
        ];

        if (!empty($this->apiKey)) {
            $headers['Authorization'] = 'Bearer ' . $this->apiKey;
        }

        return $headers;
    }

    /**
     * Sends a request to the Recycle Bin API.
     */
    private function request(string $method, string $uri, array $options = []): array
    {
        try {
            $response = $this->client->request($method, $uri, $options);
            $data = json_decode($response->getBody()->getContents(), true);

            if (!$data['success']) {
                throw new \Exception($data['error']['message'] ?? 'API request failed');
            }

            return $data['data'] ?? [];
        } catch (GuzzleException $e) {
            throw new \Exception('HTTP request failed: ' . $e->getMessage(), $e->getCode(), $e);
        }
    }

    public function list(array $params = []): array
    {
        return $this->request('GET', 'items', [
            'query' => $params
        ]);
    }

    public function get(string $id): array
    {
        return $this->request('GET', "items/{$id}");
    }

    public function backup(
        string $userId,
        string $contentType,
        string $originalId,
        array $snapshot,
        array $metadata = [],
        int $retentionDays = 30,
        bool $deleteFromOriginalTable = false,
        string $tableName = null,
        string $idField = 'id'
    ): array {
        return $this->request('POST', 'items', [
            'json' => [
                'userId' => $userId,
                'contentType' => $contentType,
                'originalId' => $originalId,
                'snapshot' => $snapshot,
                'metadata' => $metadata,
                'retentionDays' => $retentionDays,
                'deleteFromOriginalTable' => $deleteFromOriginalTable,
                'tableName' => $tableName,
                'idField' => $idField,
            ]
        ]);
    }

    public function restore(string $id, string $tableName = null, string $idField = 'id'): array
    {
        return $this->request('POST', "items/{$id}/restore", [
            'json' => [
                'tableName' => $tableName,
                'idField' => $idField,
            ]
        ]);
    }

    public function delete(string $id): array
    {
        return $this->request('DELETE', "items/{$id}");
    }

    public function empty(): array
    {
        return $this->request('POST', 'empty');
    }

    public function cleanup(): array
    {
        return $this->request('POST', 'cleanup');
    }
}
