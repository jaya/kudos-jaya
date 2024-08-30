slack datastore query '{"datastore":"recognition","app":"A07KMGR024Q"}'
slack datastore query '{"datastore":"wallet","app":"A07KMGR024Q"}'
slack datastore query '{"datastore":"workspace","app":"A07KMGR024Q"}'

slack datastore delete '{"datastore":"workspace","app":"A07KMGR024Q","id":"384cc0c0-197b-4e82-8a69-f229107ac6e5"}'

slack datastore bulk-delete '{"app":"A07KMGR024Q", "datastore": "workspace", "ids": ["d4925d93-adb0-421c-b8c5-bd93243febec", "6834f36b-d584-4211-a70d-2b9559ca18bb"]}'
