using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using YL.Models.Dtos.Apis;
using YL.Models.Services;

namespace YL.Controllers.Apis
{
	[ApiController]
	public class KakaoApiController : BaseApiController
	{
		private ILogger Logger { get; }

		public KakaoApiController(IConfiguration configuration, ILogger<KakaoUserRequest> logger) : base(configuration)
		{
			this.Logger = logger;
		}

		[HttpPost]
		[Route("GetResponse")]
		public JsonResult GetResponse([FromBody]dynamic value)
		{
			KakaoModel kakaoModel = JsonConvert.DeserializeObject<KakaoModel>(value.ToString());
			//string result = new ChatGptService().SendMessageGpt(kakaoModel.UserRequest.Utterance);
			string result = kakaoModel.UserRequest.Utterance;

			//this.Logger.LogInformation($"Utterance: {kakaoModel.UserRequest.Utterance}");

			return this.Json(new { answer = new { status = "normal", sentence = result, dialog = "finish" } });
		}
	}
}
