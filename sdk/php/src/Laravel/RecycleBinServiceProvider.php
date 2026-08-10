<?php

namespace Crty\RecycleBin\Laravel;

use Illuminate\Support\ServiceProvider;
use Crty\RecycleBin\RecycleBinClient;

class RecycleBinServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->mergeConfigFrom(__DIR__ . '/../../config/recycle_bin.php', 'recycle_bin');

        $this->app->singleton(RecycleBinClient::class, function ($app) {
            $config = $app['config']['recycle_bin'];
            return new RecycleBinClient(
                $config['api_url'] ?? 'http://localhost:3000/api/v1/recycle-bin',
                $config['site_id'] ?? '',
                $config['api_key'] ?? ''
            );
        });

        $this->app->alias(RecycleBinClient::class, 'recycle-bin');
    }

    public function boot()
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../../config/recycle_bin.php' => config_path('recycle_bin.php'),
            ], 'config');
        }
    }
}
