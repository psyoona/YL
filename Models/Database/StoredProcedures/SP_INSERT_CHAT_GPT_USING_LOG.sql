IF OBJECT_ID('SP_INSERT_CHAT_GPT_USING_LOG') IS NOT NULL
	DROP PROCEDURE SP_INSERT_CHAT_GPT_USING_LOG
GO

CREATE PROCEDURE SP_INSERT_CHAT_GPT_USING_LOG
	@USING_TYPE			NVARCHAR(50)
	,@MESSAGE			NVARCHAR(MAX)
	,@RESPONSE			NVARCHAR(MAX)
WITH ENCRYPTION
AS
SET NOCOUNT ON;

INSERT	dbo.CHAT_GPT_USING_LOGS
(
	USING_TYPE
	,[MESSAGE]
	,RESPONSE
	,INSERT_DATE
)
VALUES
(
	@USING_TYPE
	,@MESSAGE
	,@RESPONSE
	,GETDATE()
);

SET NOCOUNT OFF;
GO