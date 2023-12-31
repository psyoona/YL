IF (OBJECT_ID('dbo.CHAT_GPT_API_KEYS') IS NOT NULL) AND (OBJECTPROPERTY(OBJECT_ID('dbo.CHAT_GPT_API_KEYS'), 'IsUserTable')=1)
	DROP TABLE dbo.CHAT_GPT_API_KEYS
GO

CREATE TABLE dbo.CHAT_GPT_API_KEYS
(
	USING_KEY			NVARCHAR(128)	NOT NULL
	,API_KEY			NVARCHAR(70)	NOT NULL
)
GO

-- Primary Key
ALTER TABLE dbo.CHAT_GPT_API_KEYS WITH NOCHECK ADD
	CONSTRAINT PK_CHAT_GPT_API_KEYS PRIMARY KEY CLUSTERED (USING_KEY) ON [PRIMARY]
GO

INSERT	dbo.CHAT_GPT_API_KEYS
(
	USING_KEY
	,API_KEY
)
VALUES
(
	'd404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db'
	,'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'
);