// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange icon-glyph: quote-right

const param = args.widgetParameter;
const User = param || "lJkkk";
const City = "nanjing";
const WeatherKey = "bd1fc425fdfe4efb58c0dbf82ee7f14d"; // 高德key
const AQIToken = "94256021ae8d23a2574a6bf13cc171109aebc633"; // https://aqicn.org/data-platform/token/#/

const aqi = await getAQI();
const timeData = await getTimeData();
const weatherData = await getWeather();
const dayTalk = await getYiYanData();

const widget = createWidget();
Script.setWidget(widget);
Script.complete();

function createWidget() {
  const w = new ListWidget();
  const bgColor = new LinearGradient();

  bgColor.colors = [
    new Color("transparent"),
    new Color("transparent"),
    new Color("transparent"),
  ];
  bgColor.locations = [0.0, 0.5, 1.0];
  w.backgroundGradient = bgColor;

  w.setPadding(12, 12, 12, 0);
  w.spacing = 6;

  const time = new Date();

  const hour = time.getHours();
  const isMidnight = hour < 8 && "midnight";
  const isMorning = hour >= 8 && hour < 12 && "morning";
  const isAfternoon = hour >= 12 && hour < 19 && "afternoon";
  const isEvening = hour >= 19 && hour < 21 && "evening";
  const isNight = hour >= 21 && "night";

  const dfTime = new DateFormatter();
  dfTime.locale = "cn";
  dfTime.useMediumDateStyle();
  dfTime.useNoTimeStyle();

  const Line1 = w.addText(
    `💡 Hi, ${User}. Good ${
      isMidnight || isMorning || isAfternoon || isEvening || isNight
    }`
  );
  Line1.textColor = new Color("#ffffff");
  Line1.font = new Font("Menlo", 12);

  const enTime = dfTime.string(time);
  const Line2 = w.addText(`📅 ${enTime} ${timeData}`);
  Line2.textColor = new Color("#C6FFDD");
  Line2.font = new Font("Menlo", 12);

  const Line3 = w.addText(`☁️ ${weatherData}`);
  Line3.textColor = new Color("#FBD786");
  Line3.font = new Font("Menlo", 12);

  const Line4 = w.addText(
    `${Device.isCharging() ? "⚡️" : "🔋"} ${renderBattery()} 电量`
  );
  Line4.textColor = new Color("#2aa876");
  Line4.font = new Font("Menlo", 12);

  const Line5 = w.addText(`🦔 ${dayTalk}`);
  Line5.textColor = new Color("#f19c65");
  Line5.font = new Font("Menlo", 12);

  return w;
}

async function getAQI() {
  const url = `https://api.waqi.info/feed/${City}/?token=${AQIToken}`;
  const request = new Request(url);
  const res = await request.loadJSON();
  return res.data.aqi;
}

async function getTimeData() {
  const data = new Date();
  const week = ["日", "一", "二", "三", "四", "五", "六"][new Date().getDay()];
  return `周${week}`;
}

async function getWeather() {
  const requestWeatherInfo = new Request(
    `https://restapi.amap.com/v3/weather/weatherInfo?city=320100&key=${WeatherKey}`
  );
  const resCityInfo = await requestWeatherInfo.loadJSON();
  const {
    city: cityName,
    temperature,
    humidity,
    weather,
    reporttime,
  } = resCityInfo.lives[0];

  return `${cityName} ${weather} 温度:${temperature}° 湿度:${humidity}%  AQI:${aqi}`;
}

async function getYiYanData() {
  const yiYan = new Request(`https://v1.hitokoto.cn//`);
  const data = await yiYan.loadJSON();
  return `${data.hitokoto} - ${data.from || data.from_who}`;
}
function renderProgress(progress) {
  const used = "▓".repeat(Math.floor(progress * 24));
  const left = "░".repeat(24 - used.length);
  return `${used}${left} ${Math.floor(progress * 100)}%`;
}

function renderBattery() {
  const batteryLevel = Device.batteryLevel();
  return renderProgress(batteryLevel);
}

function renderYearProgress() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const progress = (now - start) / (end - start);
  return renderProgress(progress);
}
