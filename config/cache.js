const Redis = require('ioredis');
const NodeCache = require('node-cache');

// Configuração do Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  family: 4,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  enableOfflineQueue: true
};

// Cria clientes Redis
const redisClient = new Redis(redisConfig);
const redisPub = new Redis(redisConfig);
const redisSub = new Redis(redisConfig);

// Configuração do cache local (memória)
const localCache = new NodeCache({
  stdTTL: 600, // 10 minutos padrão
  checkperiod: 120, // Verifica a cada 2 minutos
  maxKeys: 1000, // Máximo de 1000 chaves
  useClones: false,
  deleteOnExpire: true
});

// Funções de utilidade para Redis
const redis = {
  // Get com fallback para local cache
  async get(key, useLocal = true) {
    try {
      if (useLocal && localCache.has(key)) {
        return localCache.get(key);
      }

      const value = await redisClient.get(key);
      if (value !== null && useLocal) {
        localCache.set(key, value);
      }
      return value;
    } catch (error) {
      console.error('Erro ao buscar do Redis:', error);
      return useLocal ? localCache.get(key) : null;
    }
  },

  // Set com TTL
  async set(key, value, ttl = 600, useLocal = true) {
    try {
      await redisClient.setex(key, ttl, value);
      if (useLocal) {
        localCache.set(key, value, ttl);
      }
      return true;
    } catch (error) {
      console.error('Erro ao salvar no Redis:', error);
      if (useLocal) {
        localCache.set(key, value, ttl);
      }
      return false;
    }
  },

  // Delete
  async del(key, useLocal = true) {
    try {
      await redisClient.del(key);
      if (useLocal) {
        localCache.del(key);
      }
      return true;
    } catch (error) {
      console.error('Erro ao deletar do Redis:', error);
      if (useLocal) {
        localCache.del(key);
      }
      return false;
    }
  },

  // Exists
  async exists(key, useLocal = true) {
    try {
      if (useLocal && localCache.has(key)) {
        return true;
      }
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Erro ao verificar existência no Redis:', error);
      return useLocal ? localCache.has(key) : false;
    }
  },

  // TTL
  async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Erro ao verificar TTL no Redis:', error);
      return -1;
    }
  },

  // Expire
  async expire(key, seconds) {
    try {
      return await redisClient.expire(key, seconds);
    } catch (error) {
      console.error('Erro ao definir expiração no Redis:', error);
      return false;
    }
  },

  // Increment
  async incr(key, ttl = 600) {
    try {
      const value = await redisClient.incr(key);
      if (ttl > 0) {
        await redisClient.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error('Erro ao incrementar no Redis:', error);
      return null;
    }
  },

  // Decrement
  async decr(key) {
    try {
      return await redisClient.decr(key);
    } catch (error) {
      console.error('Erro ao decrementar no Redis:', error);
      return null;
    }
  },

  // Hash operations
  async hget(key, field) {
    try {
      return await redisClient.hget(key, field);
    } catch (error) {
      console.error('Erro ao buscar hash do Redis:', error);
      return null;
    }
  },

  async hset(key, field, value) {
    try {
      return await redisClient.hset(key, field, value);
    } catch (error) {
      console.error('Erro ao salvar hash no Redis:', error);
      return false;
    }
  },

  async hgetall(key) {
    try {
      return await redisClient.hgetall(key);
    } catch (error) {
      console.error('Erro ao buscar todos os campos do hash do Redis:', error);
      return {};
    }
  },

  async hdel(key, field) {
    try {
      return await redisClient.hdel(key, field);
    } catch (error) {
      console.error('Erro ao deletar hash do Redis:', error);
      return false;
    }
  },

  // List operations
  async lpush(key, value) {
    try {
      return await redisClient.lpush(key, value);
    } catch (error) {
      console.error('Erro ao fazer lpush no Redis:', error);
      return null;
    }
  },

  async rpush(key, value) {
    try {
      return await redisClient.rpush(key, value);
    } catch (error) {
      console.error('Erro ao fazer rpush no Redis:', error);
      return null;
    }
  },

  async lpop(key) {
    try {
      return await redisClient.lpop(key);
    } catch (error) {
      console.error('Erro ao fazer lpop no Redis:', error);
      return null;
    }
  },

  async rpop(key) {
    try {
      return await redisClient.rpop(key);
    } catch (error) {
      console.error('Erro ao fazer rpop no Redis:', error);
      return null;
    }
  },

  async llen(key) {
    try {
      return await redisClient.llen(key);
    } catch (error) {
      console.error('Erro ao verificar tamanho da lista no Redis:', error);
      return 0;
    }
  },

  // Set operations
  async sadd(key, member) {
    try {
      return await redisClient.sadd(key, member);
    } catch (error) {
      console.error('Erro ao adicionar ao set no Redis:', error);
      return null;
    }
  },

  async srem(key, member) {
    try {
      return await redisClient.srem(key, member);
    } catch (error) {
      console.error('Erro ao remover do set no Redis:', error);
      return null;
    }
  },

  async smembers(key) {
    try {
      return await redisClient.smembers(key);
    } catch (error) {
      console.error('Erro ao buscar membros do set no Redis:', error);
      return [];
    }
  },

  async sismember(key, member) {
    try {
      return await redisClient.sismember(key, member);
    } catch (error) {
      console.error('Erro ao verificar membro do set no Redis:', error);
      return false;
    }
  },

  // Pub/Sub
  async publish(channel, message) {
    try {
      return await redisPub.publish(channel, message);
    } catch (error) {
      console.error('Erro ao publicar no Redis:', error);
      return false;
    }
  },

  subscribe(channel, callback) {
    try {
      redisSub.subscribe(channel);
      redisSub.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message);
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao se inscrever no Redis:', error);
      return false;
    }
  },

  // Funções de utilidade
  async flushall() {
    try {
      await redisClient.flushall();
      localCache.flushAll();
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  },

  async keys(pattern) {
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error('Erro ao buscar chaves no Redis:', error);
      return [];
    }
  },

  async info() {
    try {
      return await redisClient.info();
    } catch (error) {
      console.error('Erro ao buscar info do Redis:', error);
      return '';
    }
  },

  // Cache helper functions
  async remember(key, ttl, callback, useLocal = true) {
    let value = await this.get(key, useLocal);

    if (value === null) {
      value = await callback();
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttl, useLocal);
      }
    }

    return value;
  },

  async rememberForever(key, callback, useLocal = true) {
    return this.remember(key, 0, callback, useLocal);
  },

  async forget(pattern, useLocal = true) {
    const keys = await this.keys(pattern);
    for (const key of keys) {
      await this.del(key, useLocal);
    }
    return keys.length;
  },

  // Cache tags (simplificado)
  async taggedSet(tag, key, value, ttl = 600) {
    const tagKey = `tag:${tag}`;
    await this.sadd(tagKey, key);
    await this.set(key, value, ttl);
  },

  async taggedFlush(tag) {
    const tagKey = `tag:${tag}`;
    const keys = await this.smembers(tagKey);
    for (const key of keys) {
      await this.del(key);
    }
    await this.del(tagKey);
  },

  // Estatísticas do cache
  async stats() {
    try {
      const info = await this.info();
      const usedMemory = info.match(/used_memory:(\d+)/)?.[1] || '0';
      const connectedClients = info.match(/connected_clients:(\d+)/)?.[1] || '0';
      const totalCommands = info.match(/total_commands_processed:(\d+)/)?.[1] || '0';

      return {
        redis: {
          usedMemory: parseInt(usedMemory),
          connectedClients: parseInt(connectedClients),
          totalCommands: parseInt(totalCommands)
        },
        local: {
          keys: localCache.keys().length,
          stats: localCache.getStats()
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do cache:', error);
      return { error: 'Failed to get cache stats' };
    }
  }
};

// Event listeners
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

redisClient.on('reconnecting', () => {
  console.log('Redis Client Reconnecting...');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await redisClient.quit();
    await redisPub.quit();
    await redisSub.quit();
    console.log('Redis connections closed');
  } catch (error) {
    console.error('Error closing Redis connections:', error);
  }
});

module.exports = {
  redis,
  redisClient,
  redisPub,
  redisSub,
  localCache
};
