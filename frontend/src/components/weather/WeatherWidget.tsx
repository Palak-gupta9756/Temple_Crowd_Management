import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudRain, Sun, CloudFog, Thermometer, Wind, Droplets, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  templeId: string;
  templeName?: string;
  compact?: boolean;
}

interface WeatherData {
  templeId: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "hot";
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  feelsLike: number;
  forecast: Array<{
    date: string;
    minTemp: number;
    maxTemp: number;
    condition: string;
    rainProbability: number;
  }>;
}

interface Advisory {
  advisory: string;
  recommendations: string[];
  visitSuitability: "excellent" | "good" | "moderate" | "poor";
}

export function WeatherWidget({ templeId, templeName, compact = false }: WeatherWidgetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["weather", templeId],
    queryFn: async () => {
      const res = await fetch(`/api/v2/weather/${templeId}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      return res.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const weather: WeatherData | null = data?.weather;
  const advisory: Advisory | null = data?.advisory;
  const crowdMultiplier: number = data?.crowdMultiplier || 1;

  const getWeatherIcon = (condition: string, size = "w-8 h-8") => {
    switch (condition) {
      case "sunny": return <Sun className={cn(size, "text-yellow-500")} />;
      case "hot": return <Sun className={cn(size, "text-orange-500")} />;
      case "cloudy": return <Cloud className={cn(size, "text-gray-500")} />;
      case "rainy": return <CloudRain className={cn(size, "text-blue-500")} />;
      case "stormy": return <CloudRain className={cn(size, "text-purple-500")} />;
      case "foggy": return <CloudFog className={cn(size, "text-gray-400")} />;
      default: return <Sun className={cn(size, "text-yellow-500")} />;
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "excellent": return "bg-green-500";
      case "good": return "bg-green-400";
      case "moderate": return "bg-yellow-500";
      case "poor": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case "excellent":
      case "good":
        return <CheckCircle2 className="w-4 h-4" />;
      case "moderate":
        return <Info className="w-4 h-4" />;
      case "poor":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn(compact ? "w-full" : "")}>
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  // Compact version for embedding in other components
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg">
        {getWeatherIcon(weather.condition, "w-6 h-6")}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{weather.temperature}°C</span>
            <span className="text-sm text-gray-500 capitalize">{weather.condition}</span>
          </div>
          <div className="text-xs text-gray-500">
            Feels like {weather.feelsLike}°C • {weather.humidity}% humidity
          </div>
        </div>
        {advisory && (
          <Badge className={cn("text-white text-xs", getSuitabilityColor(advisory.visitSuitability))}>
            {advisory.visitSuitability}
          </Badge>
        )}
      </div>
    );
  }

  // Full version
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-orange-400 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white">{templeName || "Weather"}</CardTitle>
            <CardDescription className="text-white/80">Current Conditions</CardDescription>
          </div>
          {getWeatherIcon(weather.condition, "w-12 h-12")}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold">{weather.temperature}°C</div>
            <div className="text-gray-500 capitalize">{weather.condition}</div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div className="flex items-center gap-1 justify-end">
              <Thermometer className="w-4 h-4" />
              Feels like {weather.feelsLike}°C
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Droplets className="w-4 h-4" />
              {weather.humidity}% humidity
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Wind className="w-4 h-4" />
              {weather.windSpeed} km/h wind
            </div>
          </div>
        </div>

        {/* Rain Probability */}
        {weather.rainProbability > 20 && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg mb-4">
            <CloudRain className="w-5 h-5 text-blue-500" />
            <span className="text-sm">
              {weather.rainProbability}% chance of rain
            </span>
          </div>
        )}

        {/* Visit Suitability */}
        {advisory && (
          <div className={cn(
            "p-3 rounded-lg mb-4",
            advisory.visitSuitability === "excellent" || advisory.visitSuitability === "good"
              ? "bg-green-50"
              : advisory.visitSuitability === "moderate"
              ? "bg-yellow-50"
              : "bg-red-50"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {getSuitabilityIcon(advisory.visitSuitability)}
              <span className="font-medium capitalize">
                {advisory.visitSuitability} for Visit
              </span>
              <Badge className={cn("ml-auto text-white", getSuitabilityColor(advisory.visitSuitability))}>
                {crowdMultiplier < 1 ? "Fewer Crowds" : crowdMultiplier > 1 ? "More Crowds" : "Normal"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{advisory.advisory}</p>
          </div>
        )}

        {/* Recommendations */}
        {advisory && advisory.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Recommendations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {advisory.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 5-Day Forecast */}
        {weather.forecast && weather.forecast.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">5-Day Forecast</h4>
            <div className="flex gap-2 overflow-x-auto">
              {weather.forecast.map((day, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 text-center p-2 bg-gray-50 rounded-lg min-w-[70px]"
                >
                  <div className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="my-1">
                    {getWeatherIcon(day.condition, "w-5 h-5 mx-auto")}
                  </div>
                  <div className="text-xs font-medium">
                    {day.maxTemp}° / {day.minTemp}°
                  </div>
                  {day.rainProbability > 30 && (
                    <div className="text-xs text-blue-500">
                      {day.rainProbability}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;
