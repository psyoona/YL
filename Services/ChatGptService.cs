using Newtonsoft.Json;
using RestSharp;

namespace YL.Services
{
    public class ChatGptService
    {
        public string ApiKey { get; set; }

        public ChatGptService(string apiKey)
        {
            ApiKey = apiKey;
        }

        public string SendMessageGpt(string messageText)
        {
            RestClient client = new RestClient("https://api.openai.com/v1/chat/completions");

            // Create a new POST request
            var request = new RestRequest("", Method.Post);
            // Set the Content-Type header
            request.AddHeader("Content-Type", "application/json");
            // Set the Authorization header with the API key
            request.AddHeader("Authorization", $"Bearer {ApiKey}");

            var messages = new List<dynamic>
            {
                new { role = "system",
                    content = "You are ChatGPT, a large language " +
                                "model trained by OpenAI. " +
                                "Answer as concisely as possible.  " },
                new { role="user", content = messageText }
            };

            // Create the request body with the message and other parameters
            var requestBody = new
            {
                model = "gpt-3.5-turbo-1106",
                max_tokens = 1000,
                n = 1,
                stop = (string?)null,
                temperature = 0.7,
                messages
            };

            // Add the JSON body to the request
            request.AddJsonBody(JsonConvert.SerializeObject(requestBody));

            // Execute the request and receive the response
            var response = client.Execute(request);

            // Deserialize the response JSON content
            var jsonResponse = JsonConvert.DeserializeObject<dynamic>(response.Content);

            // Extract and return the chatbot's response text
            var choices = jsonResponse.choices;
            var result = choices[0].message.content;

            return result;
        }
    }
}
