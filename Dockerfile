# 1. 베이스 이미지 설정 (ASP.NET Core 런타임)
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app

# 2. 빌드 및 복사 단계
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

# 3. 실행 단계
FROM base AS final
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "YL.dll"]
