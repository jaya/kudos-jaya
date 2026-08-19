SELECT u.id, u.name, u."teamId", 
       i."teamName", i."defaultRecognitionChannel", 
       i.bot
FROM "user" u
LEFT JOIN "installation" i ON u."teamId" = i."teamId"
WHERE u.name = 'Mancha' OR i."teamName" = 'allset'
LIMIT 10;
