using Microsoft.AspNetCore.HttpLogging;
using YL.Configs;
using YL.Handlers;
using YL.Validators;

var builder = WebApplication.CreateBuilder(args);

ConfigManager.Initialize(builder.Configuration);

builder.Services.AddHttpLogging(o =>
{
	o.LoggingFields =
		HttpLoggingFields.RequestPropertiesAndHeaders |
		HttpLoggingFields.ResponsePropertiesAndHeaders |
		HttpLoggingFields.Duration;

	o.RequestBodyLogLimit = 0;
	o.ResponseBodyLogLimit = 0;
});

// Add services to the container.
builder.Services.AddControllersWithViews();


var app = builder.Build();

ErrorCodeValidator.Validate(app.Environment.WebRootPath);

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseMiddleware<ErrorHandlerMiddleware>();

app.UseAuthorization();

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Laboratory}/{action=BaseConverter}/{id?}");

app.MapGet("/health", () => "OK");

app.Run();