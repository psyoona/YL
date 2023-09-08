using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using YL.Models.Dtos.Apis;

namespace YL.Controllers.Apis
{
	[ApiController]
	public class KakaoApiController : BaseApiController
	{
		private ILogger Logger { get; }

		public KakaoApiController(IConfiguration configuration, ILogger<KakaoAction> logger) : base(configuration)
		{
			this.Logger = logger;
		}

		[HttpPost]
		[Route("GetResponse")]
		public JsonResult GetResponse([FromBody]dynamic value)
		{
			this.Logger.LogInformation($"userRequest: {value}");
			//this.Logger.LogInformation($"request: {Request.Body}");

			KakaoModel kakaoModel = JsonConvert.DeserializeObject<KakaoModel>(value.ToString());
			this.Logger.LogInformation($"UserKey: {kakaoModel.Action.Params.UserKey}");
			this.Logger.LogInformation($"Content: {kakaoModel.Action.Params.Content}");
			this.Logger.LogInformation($"Type: {kakaoModel.Action.Params.Type}");

			//return this.Json(new { message = new { text = kakaoModel.Action.Params.Content }, keyboard = new { type = "text" } }, this.JsonSerializerOptions);

			return this.Json(new { answer = new { status = "normal", sentence = kakaoModel.Action.Params.Content, dialog = "finish" } });
		}
	}
}
