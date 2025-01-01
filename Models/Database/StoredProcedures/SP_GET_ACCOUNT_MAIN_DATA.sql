IF OBJECT_ID('SP_GET_ACCOUNT_MAIN_DATA') IS NOT NULL
	DROP PROCEDURE SP_GET_ACCOUNT_MAIN_DATA
GO

CREATE PROCEDURE SP_GET_ACCOUNT_MAIN_DATA
WITH ENCRYPTION
AS
SET NOCOUNT ON;

SELECT	ACCOUNT_NO
	,BALANCE
FROM	dbo.ACCOUNTS;

SELECT	TOP 10 ACCOUNT_NO
	,[DESCRIPTION]
	,DELTA
	,TEMP_BALANCE
	,USING_DATE
FROM	dbo.ACCOUNT_HISTORIES
ORDER BY USING_DATE DESC;

SET NOCOUNT OFF;
GO

--EXEC	dbo.SP_GET_ACCOUNT_MAIN_DATA;