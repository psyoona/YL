﻿using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using YL.Models.Dtos.Apis;
using YL.Services;

namespace YL.Controllers.Apis
{
	[ApiController]
	public class KakaoApiController : BaseApiController
	{
		private ILogger Logger { get; }

		public KakaoApiController(IConfiguration configuration, ILogger<KakaoUserRequest> logger)
		{
			this.Logger = logger;
		}

		[HttpPost]
		[Route("GetResponse")]
		public JsonResult GetResponse([FromBody]dynamic value)
		{
			KakaoModel kakaoModel = JsonConvert.DeserializeObject<KakaoModel>(value.ToString());
			string message = kakaoModel.UserRequest.Utterance;

			string result = new KakaoChatService().ParsingMessage(message);

			return this.Json(new { answer = new { status = "normal", sentence = result, dialog = "finish" } });
		}
	}
}
