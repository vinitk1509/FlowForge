package com.flowforge.execution.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class DistributedLockService {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    /**
     * Acquire a distributed lock with automatic lease expiration.
     */
    public boolean acquireLock(String lockKey, String lockValue, Duration timeout) {
        if (redisTemplate == null) {
            // If Redis is not configured or disabled in tests, allow fallback
            return true;
        }
        try {
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, lockValue, timeout);
            return Boolean.TRUE.equals(acquired);
        } catch (Exception e) {
            log.warn("Failed to contact Redis for lock [{}], proceeding with local execution: {}", lockKey, e.getMessage());
            return true;
        }
    }

    /**
     * Release the distributed lock safely if the value matches.
     */
    public void releaseLock(String lockKey, String lockValue) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String currentValue = redisTemplate.opsForValue().get(lockKey);
            if (lockValue != null && lockValue.equals(currentValue)) {
                redisTemplate.delete(lockKey);
            }
        } catch (Exception e) {
            log.warn("Failed to release lock [{}] in Redis: {}", lockKey, e.getMessage());
        }
    }
}
