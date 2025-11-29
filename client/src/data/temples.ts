import somnathImg from "@assets/generated_images/majestic_somnath_temple_at_sunset_by_the_sea.png";
import dwarkaImg from "@assets/generated_images/grand_dwarkadhish_temple_architecture.png";
import ambajiImg from "@assets/generated_images/ambaji_temple_glowing_at_twilight.png";
import pavagadhImg from "@assets/generated_images/pavagadh_kalika_mata_temple_on_hilltop.png";

export interface Temple {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  timings: string;
  aartiTimes: string[];
  features: string[];
  history: string;
}

export const temples: Temple[] = [
  {
    id: "somnath",
    name: "Somnath Mahadev",
    location: "Prabhas Patan, Veraval",
    description: "The first among the twelve Jyotirlinga shrines of Shiva, located on the western coast of Gujarat.",
    image: somnathImg,
    timings: "6:00 AM - 9:30 PM",
    aartiTimes: ["7:00 AM", "12:00 PM", "7:00 PM"],
    features: ["Light & Sound Show", "Sea View", "Live Darshan"],
    history: "Reconstructed several times in the past after repeated destruction by several Muslim invaders and rulers."
  },
  {
    id: "dwarka",
    name: "Dwarkadhish Temple",
    location: "Dwarka",
    description: "Dedicated to Lord Krishna, who is worshipped here by the name Dwarkadhish, or 'King of Dwarka'.",
    image: dwarkaImg,
    timings: "6:30 AM - 1:00 PM, 5:00 PM - 9:30 PM",
    aartiTimes: ["6:30 AM", "10:30 AM", "7:30 PM", "8:30 PM"],
    features: ["Gomti Ghat", "Sudama Setu", "Flag Changing Ceremony"],
    history: "The main shrine of the 5-storied building, supported by 72 pillars, is known as Jagat Mandir or Nija Mandir."
  },
  {
    id: "ambaji",
    name: "Ambaji Mata Temple",
    location: "Ambaji, Banaskantha",
    description: "A major Shakti Peeth. Uniquely, there is no idol of the goddess; the holy Shree Visa Yantra is worshipped.",
    image: ambajiImg,
    timings: "7:00 AM - 11:30 AM, 12:30 PM - 4:30 PM, 6:30 PM - 9:00 PM",
    aartiTimes: ["7:00 AM", "7:00 PM"],
    features: ["Gabbar Hill Ropeway", "Light Show", "Akhand Jyot"],
    history: "It is one of the 51 Shakti Peethas. The heart of Devi Sati is believed to have fallen here."
  },
  {
    id: "pavagadh",
    name: "Kalika Mata Temple",
    location: "Pavagadh Hill, Panchmahal",
    description: "A Hindu goddess temple complex and pilgrim centre at the summit of Pavagadh Hill.",
    image: pavagadhImg,
    timings: "5:00 AM - 7:00 PM",
    aartiTimes: ["5:00 AM", "7:00 PM"],
    features: ["Ropeway", "Champaner Heritage Park", "Trekking Path"],
    history: "The temple dates from the 10th or 11th centuries. It is the site of one of the Great Holy Shakti Peethas."
  }
];
