<?php

namespace Crty\RecycleBin\Laravel\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static array list(array $params = [])
 * @method static array get(string $id)
 * @method static array backup(string $userId, string $contentType, string $originalId, array $snapshot, array $metadata = [], int $retentionDays = 30, bool $deleteFromOriginalTable = false, string $tableName = null, string $idField = 'id')
 * @method static array restore(string $id, string $tableName = null, string $idField = 'id')
 * @method static array delete(string $id)
 * @method static array empty()
 * @method static array cleanup()
 * 
 * @see \Crty\RecycleBin\RecycleBinClient
 */
class RecycleBin extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'recycle-bin';
    }
}
