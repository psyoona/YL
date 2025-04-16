USE [master]
GO
 
IF EXISTS (SELECT * FROM sys.server_triggers WHERE name= 'TR_BLOCK_INVALID_CONNECTION')
        DROP TRIGGER TR_BLOCK_INVALID_CONNECTION ON ALL SERVER
GO
 
CREATE TRIGGER TR_BLOCK_INVALID_CONNECTION
ON ALL SERVER
FOR LOGON
AS

DECLARE	@REMOTE_IP_ADDRESS NVARCHAR(48) = CONVERT(NVARCHAR(48), CONNECTIONPROPERTY('client_net_address'))
	,@FORMATTED_MESSAGE NVARCHAR(4000);

IF @REMOTE_IP_ADDRESS NOT IN ('61.255.202.149', '1.234.167.161', '<local machine>', '141.164.52.227')
    BEGIN
	PRINT	'Login attempt from unauthorized IP address: ' + @REMOTE_IP_ADDRESS;
	SET	@FORMATTED_MESSAGE = FORMATMESSAGE('Login from this IP is not allowed: %s', @REMOTE_IP_ADDRESS);
	THROW	50000, @FORMATTED_MESSAGE, 1;
    END