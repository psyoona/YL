using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using YL.Helpers;
using YL.Models.Daos;
using YL.Models.Dtos.Commons;

namespace YL.Handlers
{
	public class ErrorHandlerMiddleware
	{
		public ErrorHandlerMiddleware(RequestDelegate next)
		{
			Next = next;
		}

		private RequestDelegate Next { get; }

		public async Task Invoke(HttpContext context)
		{
			context.Request.EnableBuffering();

			try
			{
				await Next(context);
			}
			catch (Exception exception)
			{
				int? errorCode = null;
				HttpResponse response = context.Response;
				response.ContentType = "application/json";
				string result = string.Empty;

				JsonSerializerOptions options = new JsonSerializerOptions();
				options.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
				options.WriteIndented = true;

				if (context.Request.RouteValues["controller"].ToString().ToLower().Contains("kakaoapi"))
				{
					result = JsonSerializer.Serialize(new { answer = new { status = "normal", sentence = exception.Message, dialog = "finish" } }, options);
				}
				else if (exception is CustomException customException)
				{
					errorCode = customException.Code;
					string locale = LocaleHelper.GetLocaleFromRequest(context.Request);
					string message = LocaleHelper.GetMessage(customException.Code, locale);

					result = JsonSerializer.Serialize(new { success = false, code = customException.Code, message }, options);
				}
				else
				{
					result = JsonSerializer.Serialize(new { success = false, message = exception.Message }, options);
				}

				this.SaveErrorLog(context, exception, errorCode);

				await response.WriteAsync(result);
			}
		}

		private void SaveErrorLog(HttpContext context, Exception exception, int? errorCode)
		{
			try
			{
				string requestBody = string.Empty;

				context.Request.Body.Position = 0;
				using (var reader = new StreamReader(context.Request.Body, leaveOpen: true))
				{
					requestBody = reader.ReadToEndAsync().Result;
				}

				string userIp = context.Connection.RemoteIpAddress?.ToString();

				ErrorLogDao dao = new ErrorLogDao();
				dao.InsertErrorLog(
					errorCode,
					exception.Message,
					exception.StackTrace,
					context.Request.Method,
					context.Request.Path + context.Request.QueryString,
					requestBody,
					userIp);
			}
			catch
			{
			}
		}
	}
}
