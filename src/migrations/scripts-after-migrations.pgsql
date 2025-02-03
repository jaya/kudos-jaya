-- 1 - Instalar o slack no workspace da Jaya para fazer o insert em installation
-- 2 - Atualizar todas as tabelas que tem o teamId null
UPDATE "recognition" SET "teamId" = 'T033VJH10' where "teamId" IS NULL;
UPDATE "wallet" SET "teamId" = 'T033VJH10' where "teamId" IS NULL;

INSERT INTO "user" ("id", "name", "teamId")  
SELECT DISTINCT "toId", "toName", 'T033VJH10' as "teamId"
FROM "recognition"  
WHERE "teamId" IS NULL
and "toId" not in ('UDCFCCYLS');
ORDER BY "toId";

INSERT INTO "user" ("id", "name", "teamId") VALUES ('UDCFCCYLS', 'Diana Horbatiuk', 'T033VJH10');

