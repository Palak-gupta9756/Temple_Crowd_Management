import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Video, Play, Users, Clock, Calendar, Globe, 
  Volume2, VolumeX, Maximize2, Share2, Heart,
  Sun, Moon, Bell, Camera, MapPin, Info, Radio
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface TempleStream {
  id: string;
  name: string;
  location: string;
  description: string;
  streamUrl: string;
  youtubeChannelId: string;
  youtubeLiveId: string;
  isLive: boolean;
  viewerCount: number;
  schedules: {
    event: string;
    time: string;
    description: string;
  }[];
  aartiTimings: {
    name: string;
    time: string;
    duration: string;
  }[];
  image: string;
  features: string[];
}

const templeStreams: TempleStream[] = [
  {
    id: "somnath",
    name: "Somnath Temple",
    location: "Prabhas Patan, Gujarat",
    description: "One of the 12 Jyotirlingas, Somnath Temple is one of the most sacred pilgrimage sites for Hindus. Experience the divine atmosphere of Lord Shiva's abode.",
    streamUrl: "https://www.youtube.com/embed/live_stream?channel=UCqETFZDZtYjFGKKRXdD0M8g",
    youtubeChannelId: "UCqETFZDZtYjFGKKRXdD0M8g",
    youtubeLiveId: "somnath-live",
    isLive: true,
    viewerCount: 15420,
    schedules: [
      { event: "Mangala Aarti", time: "06:00 AM", description: "Morning awakening ceremony" },
      { event: "Abhishek", time: "07:00 AM", description: "Sacred bathing ritual" },
      { event: "Shringar", time: "07:30 AM", description: "Decoration of deity" },
      { event: "Bhog Aarti", time: "10:00 AM", description: "Mid-morning offering" },
      { event: "Sandhya Aarti", time: "07:00 PM", description: "Evening prayers" },
      { event: "Shayan Aarti", time: "09:00 PM", description: "Night closing ceremony" },
    ],
    aartiTimings: [
      { name: "Mangala Aarti", time: "06:00 AM", duration: "30 min" },
      { name: "Bhog Aarti", time: "10:00 AM", duration: "20 min" },
      { name: "Sandhya Aarti", time: "07:00 PM", duration: "45 min" },
      { name: "Shayan Aarti", time: "09:00 PM", duration: "30 min" },
    ],
    image: "/images/somnath.jpg",
    features: ["HD Quality", "Multiple Angles", "Audio Commentary", "24/7 Live"],
  },
  {
    id: "dwarka",
    name: "Dwarkadhish Temple",
    location: "Dwarka, Gujarat",
    description: "The legendary kingdom of Lord Krishna, Dwarkadhish Temple is one of the Char Dham pilgrimage sites. Witness the grandeur of Krishna's divine abode.",
    streamUrl: "https://www.youtube.com/embed/live_stream?channel=UCDwarkadhishTemple",
    youtubeChannelId: "UCDwarkadhishTemple",
    youtubeLiveId: "dwarka-live",
    isLive: true,
    viewerCount: 12350,
    schedules: [
      { event: "Mangala Aarti", time: "06:30 AM", description: "Morning awakening of Lord Krishna" },
      { event: "Shringar Darshan", time: "07:30 AM", description: "Decorated deity viewing" },
      { event: "Rajbhog Aarti", time: "11:00 AM", description: "Mid-day grand offering" },
      { event: "Utthapan", time: "04:00 PM", description: "Afternoon awakening" },
      { event: "Sandhya Aarti", time: "06:30 PM", description: "Evening prayers" },
      { event: "Shayan Bhog", time: "08:30 PM", description: "Night offering ceremony" },
    ],
    aartiTimings: [
      { name: "Mangala Aarti", time: "06:30 AM", duration: "25 min" },
      { name: "Rajbhog Aarti", time: "11:00 AM", duration: "30 min" },
      { name: "Sandhya Aarti", time: "06:30 PM", duration: "40 min" },
      { name: "Shayan Aarti", time: "08:30 PM", duration: "25 min" },
    ],
    image: "/images/dwarka.jpg",
    features: ["HD Quality", "Krishna Bhajans", "Multi-language", "Live Chat"],
  },
  {
    id: "ambaji",
    name: "Ambaji Temple",
    location: "Banaskantha, Gujarat",
    description: "One of the 51 Shakti Peethas, Ambaji Temple is dedicated to Goddess Amba. Experience the divine shakti and powerful spiritual energy.",
    streamUrl: "https://www.youtube.com/embed/live_stream?channel=UCAmbaji",
    youtubeChannelId: "UCAmbaji",
    youtubeLiveId: "ambaji-live",
    isLive: true,
    viewerCount: 8920,
    schedules: [
      { event: "Mangala Aarti", time: "05:30 AM", description: "Dawn worship of Goddess" },
      { event: "Shringar", time: "06:30 AM", description: "Divine decoration" },
      { event: "Navchandi Path", time: "09:00 AM", description: "Sacred recitation" },
      { event: "Madhyanh Aarti", time: "12:00 PM", description: "Noon prayers" },
      { event: "Sandhya Aarti", time: "07:30 PM", description: "Evening aarti" },
      { event: "Shayan Aarti", time: "09:30 PM", description: "Night ceremony" },
    ],
    aartiTimings: [
      { name: "Mangala Aarti", time: "05:30 AM", duration: "35 min" },
      { name: "Madhyanh Aarti", time: "12:00 PM", duration: "25 min" },
      { name: "Sandhya Aarti", time: "07:30 PM", duration: "45 min" },
      { name: "Shayan Aarti", time: "09:30 PM", duration: "30 min" },
    ],
    image: "/images/ambaji.jpg",
    features: ["HD Quality", "Garba Live", "Festival Coverage", "Devotional Songs"],
  },
  {
    id: "pavagadh",
    name: "Pavagadh Kalika Mata",
    location: "Panchmahal, Gujarat",
    description: "Perched atop Pavagadh Hill, this Shakti Peetha temple offers breathtaking views and powerful spiritual experiences. Part of UNESCO World Heritage Site.",
    streamUrl: "https://www.youtube.com/embed/live_stream?channel=UCPavagadh",
    youtubeChannelId: "UCPavagadh",
    youtubeLiveId: "pavagadh-live",
    isLive: true,
    viewerCount: 6780,
    schedules: [
      { event: "Mangala Aarti", time: "05:00 AM", description: "Mountain-top dawn worship" },
      { event: "Abhishek", time: "06:00 AM", description: "Sacred bathing ritual" },
      { event: "Shringar Darshan", time: "07:00 AM", description: "Decorated deity viewing" },
      { event: "Madhyanh Aarti", time: "12:30 PM", description: "Afternoon prayers" },
      { event: "Sandhya Aarti", time: "07:00 PM", description: "Sunset aarti" },
      { event: "Shayan Aarti", time: "09:00 PM", description: "Night closing" },
    ],
    aartiTimings: [
      { name: "Mangala Aarti", time: "05:00 AM", duration: "40 min" },
      { name: "Madhyanh Aarti", time: "12:30 PM", duration: "25 min" },
      { name: "Sandhya Aarti", time: "07:00 PM", duration: "45 min" },
      { name: "Shayan Aarti", time: "09:00 PM", duration: "30 min" },
    ],
    image: "/images/pavagadh.jpg",
    features: ["HD Quality", "Aerial Views", "Ropeway Cam", "Sunset Special"],
  },
];

export default function VirtualDarshan() {
  const [selectedTemple, setSelectedTemple] = useState<string>("somnath");
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTemple = templeStreams.find(t => t.id === selectedTemple) || templeStreams[0];

  const formatViewers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getNextEvent = (schedules: TempleStream["schedules"]) => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    for (const schedule of schedules) {
      const [time, period] = schedule.time.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let eventHour = hours;
      if (period === "PM" && hours !== 12) eventHour += 12;
      if (period === "AM" && hours === 12) eventHour = 0;
      const eventTimeMinutes = eventHour * 60 + minutes;
      
      if (eventTimeMinutes > currentTimeMinutes) {
        const diff = eventTimeMinutes - currentTimeMinutes;
        const hoursLeft = Math.floor(diff / 60);
        const minutesLeft = diff % 60;
        return {
          event: schedule.event,
          time: schedule.time,
          countdown: hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`,
        };
      }
    }
    return { event: schedules[0].event, time: schedules[0].time, countdown: "Tomorrow" };
  };

  const toggleNotification = (templeName: string) => {
    if (notifications.includes(templeName)) {
      setNotifications(notifications.filter(n => n !== templeName));
    } else {
      setNotifications([...notifications, templeName]);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Live Darshan - ${currentTemple.name}`,
      text: `Watch live darshan from ${currentTemple.name}. Experience divine blessings from anywhere!`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const nextEvent = getNextEvent(currentTemple.schedules);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-4">
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="font-semibold">{t("virtualDarshan.liveNow")}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t("virtualDarshan.title")}</h1>
          <p className="text-xl text-gray-600">{t("virtualDarshan.subtitle")}</p>
        </div>

        {/* Temple Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {templeStreams.map(temple => (
            <Button
              key={temple.id}
              variant={selectedTemple === temple.id ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                selectedTemple === temple.id 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600" 
                  : ""
              }`}
              onClick={() => setSelectedTemple(temple.id)}
            >
              <Video className="h-4 w-4" />
              {temple.name.split(" ")[0]}
              {temple.isLive && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                {/* YouTube Live Embed - Using official temple streams */}
                <iframe
                  src={`https://www.youtube.com/embed/live_stream?channel=${currentTemple.youtubeChannelId}&autoplay=1&mute=${isMuted ? 1 : 0}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${currentTemple.name} Live Darshan`}
                />
                
                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-red-600">
                        <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {formatViewers(currentTemple.viewerCount)} watching
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20"
                        onClick={handleShare}
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Video Info */}
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{currentTemple.name} - Live Darshan</h2>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {currentTemple.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleNotification(currentTemple.name)}
                      className={notifications.includes(currentTemple.name) ? "text-red-600 border-red-600" : ""}
                    >
                      <Bell className={`h-4 w-4 mr-1 ${notifications.includes(currentTemple.name) ? "fill-current" : ""}`} />
                      {notifications.includes(currentTemple.name) ? "Notifying" : "Notify Me"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-gray-600">{currentTemple.description}</p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentTemple.features.map(feature => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Event Alert */}
            <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <span className="font-semibold text-amber-800">Next: {nextEvent.event}</span>
                  <span className="text-amber-700"> at {nextEvent.time}</span>
                </span>
                <Badge className="bg-amber-600">{nextEvent.countdown}</Badge>
              </AlertDescription>
            </Alert>

            {/* Multi-Temple Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  All Temple Streams
                </CardTitle>
                <CardDescription>Watch multiple temples simultaneously</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {templeStreams.filter(t => t.id !== selectedTemple).map(temple => (
                    <div 
                      key={temple.id}
                      className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      onClick={() => setSelectedTemple(temple.id)}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/live_stream?channel=${temple.youtubeChannelId}&autoplay=0&mute=1`}
                        className="w-full h-full pointer-events-none"
                        title={`${temple.name} Preview`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center justify-between text-white text-sm">
                            <span className="font-medium">{temple.name.split(" ")[0]}</span>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span>{formatViewers(temple.viewerCount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Current Time */}
            <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
              <CardContent className="p-4 text-center">
                <p className="text-purple-200">Current Time (IST)</p>
                <p className="text-3xl font-bold">
                  {currentTime.toLocaleTimeString("en-IN", { 
                    hour: "2-digit", 
                    minute: "2-digit",
                    hour12: true 
                  })}
                </p>
                <p className="text-purple-200">
                  {currentTime.toLocaleDateString("en-IN", { 
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  })}
                </p>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentTemple.schedules.map((schedule, index) => {
                  const isNext = schedule.event === nextEvent.event;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isNext 
                          ? "bg-purple-100 border border-purple-300" 
                          : "bg-gray-50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isNext ? "bg-purple-600 text-white" : "bg-gray-200"
                      }`}>
                        {schedule.time.includes("AM") && parseInt(schedule.time) < 12 
                          ? <Sun className="h-5 w-5" />
                          : <Moon className="h-5 w-5" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isNext ? "text-purple-800" : ""}`}>
                          {schedule.event}
                        </p>
                        <p className="text-sm text-gray-500">{schedule.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isNext ? "text-purple-600" : "text-gray-700"}`}>
                          {schedule.time}
                        </p>
                        {isNext && (
                          <Badge className="bg-purple-600 text-xs">
                            {nextEvent.countdown}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Aarti Timings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Aarti Timings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentTemple.aartiTimings.map((aarti, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-amber-50"
                    >
                      <div>
                        <p className="font-medium text-amber-800">{aarti.name}</p>
                        <p className="text-sm text-amber-600">{aarti.duration}</p>
                      </div>
                      <Badge className="bg-amber-600">{aarti.time}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  View Temple Gallery
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Physical Darshan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Online Donation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Info className="h-4 w-4 mr-2" />
                  Temple Information
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Temple Info Cards */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">All Temple Live Streams</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templeStreams.map(temple => (
              <Card 
                key={temple.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemple === temple.id ? "ring-2 ring-purple-500" : ""
                }`}
                onClick={() => setSelectedTemple(temple.id)}
              >
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20" />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-600">
                      <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/60 text-white">
                      <Users className="h-3 w-3 mr-1" />
                      {formatViewers(temple.viewerCount)}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white/80" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold">{temple.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {temple.location}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {temple.features.slice(0, 2).map(f => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">How to Experience Virtual Darshan</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium">1. Select Temple</h4>
                <p className="text-sm text-gray-600">Choose from 4 sacred temples</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Play className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium">2. Watch Live</h4>
                <p className="text-sm text-gray-600">Experience real-time darshan</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium">3. Set Reminders</h4>
                <p className="text-sm text-gray-600">Get notified for aarti times</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium">4. Receive Blessings</h4>
                <p className="text-sm text-gray-600">Connect spiritually from anywhere</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
