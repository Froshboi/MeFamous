#17 0.811 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy

#17 0.835   Creating an optimized production build ...

#17 6.421 ✓ Compiled successfully in 5.4s

#17 6.443   Running TypeScript ...

#17 11.07 Failed to type check.

#17 11.07 

#17 11.07 ./lib/providers/sync.ts:48:7

#17 11.07 Type error: An object literal cannot have multiple properties with the same name.

#17 11.07 

#17 11.07   46 |       min_quantity: service.min,

#17 11.07   47 |       max_quantity: service.max,

#17 11.07 > 48 |       supports_refill: service.refill ?? false,   // ← coerce null to false

#17 11.07      |       ^

#17 11.07   49 |       supports_cancel: service.cancel ?? false,     // ← coerce null to false

#17 11.07   50 |       is_active: prior ? prior.is_active : true,

#17 11.07   51 |       synced_at: new Date().toISOString(),

#17 11.17 Next.js build worker exited with code: 1 and signal: null

#17 ERROR: process "npm run build" did not complete successfully: exit code: 1

------

 > npm run build:

11.07 Type error: An object literal cannot have multiple properties with the same name.

11.07 

11.07   46 |       min_quantity: service.min,

11.07   47 |       max_quantity: service.max,

11.07 > 48 |       supports_refill: service.refill ?? false,   // ← coerce null to false

11.07      |       ^

11.07   49 |       supports_cancel: service.cancel ?? false,     // ← coerce null to false

11.07   50 |       is_active: prior ? prior.is_active : true,

11.07   51 |       synced_at: new Date().toISOString(),

11.17 Next.js build worker exited with code: 1 and signal: null

------

error: failed to solve: process "npm run build" did not complete successfully: exit code: 1
