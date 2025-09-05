import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

export type LatLngPoint = { lat: number; lng: number };
export type Plot = {
  id: string;
  points: LatLngPoint[];
  name: string;
  area: number;
  createdAt: Date;
  carbonCredits: number;
};

export type FarmDetails = {
  name: string;
  location: string;
  totalAcres: number; 
  farmingType: "organic" | "conventional" | "mixed";
  soilType: string;
  cropDetails?: string; 
  registeredCoordinates?: string; 
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  points: number;
};

export type Notification = {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
  read: boolean;
  createdAt: Date;
};

export type VisitRequest = {
  id: string;
  farmerId: string;
  farmerName: string;
  village: string;
  locationDetails: string;
  preferredDate: string; 
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
  responseMessage?: string;
};

type FarmerContextShape = {
  farmerId: string;
  farmerName: string;
  mobileNumber: string | null;
  plots: Plot[];
  farmDetails: FarmDetails | null;
  achievements: Achievement[];
  notifications: Notification[];
  visitRequests: VisitRequest[];
  totalCarbonCredits: number;
  creditsSpent: number;
  addPlot: (
    newPlotPoints: LatLngPoint[],
    plotName: string,
    area: number
  ) => void;
  updateFarmDetails: (details: FarmDetails) => void;
  updateFarmerProfile: (data: { name?: string; mobileNumber?: string }) => void;
  addNotification: (
    message: string,
    type: "success" | "info" | "warning"
  ) => void;
  markNotificationRead: (id: string) => void;
  calculatePlotArea: (points: LatLngPoint[]) => number;
  requestVisitVerification: (data: {
    village: string;
    locationDetails: string;
    preferredDate: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  purchaseItem: (
    itemName: string,
    cost: number,
    payWithCredits: boolean
  ) => { ok: boolean; error?: string };
};

const FarmerContext = createContext<FarmerContextShape | undefined>(undefined);

export const useFarmerContext = (): FarmerContextShape => {
  const ctx = useContext(FarmerContext);
  if (!ctx) {
    throw new Error("useFarmerContext must be used within FarmerProvider");
  }
  return ctx;
};

export const FarmerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth?.() || { user: null as any };
  const [plots, setPlots] = useState<Plot[]>([]);
  const [farmDetails, setFarmDetails] = useState<FarmDetails | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [farmerNameState, setFarmerNameState] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string | null>(null);
  const [creditsSpent, setCreditsSpent] = useState<number>(0);
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [farmerId, setFarmerId] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFarmerId(user.farmerId);
      setFarmerNameState(user.name);
      setMobileNumber(user.mobile || null);
    }
  }, [user]);

  useEffect(() => {
    const isDemo =
      user && (user.provider === "google" || user.provider === "phone");
    if (!isDemo) return;
    if (plots.length > 0) return;

    // Set farm details
    setFarmDetails({
      name: `${user.name || "Demo"} Family Farm`,
      location: "Demo Village",
      totalAcres: 18.5,
      farmingType: "mixed",
      soilType: "Loamy",
      cropDetails: "Rice, Wheat rotation",
    });
    const demoPlots: Plot[] = [
      {
        id: "demo1",
        name: "North Field",
        area: 5.2,
        points: [],
        createdAt: new Date(),
        carbonCredits: 26,
      },
      {
        id: "demo2",
        name: "Rice Paddock",
        area: 7.1,
        points: [],
        createdAt: new Date(),
        carbonCredits: 35,
      },
      {
        id: "demo3",
        name: "Pasture Strip",
        area: 3.4,
        points: [],
        createdAt: new Date(),
        carbonCredits: 17,
      },
      {
        id: "demo4",
        name: "Orchard Block",
        area: 2.8,
        points: [],
        createdAt: new Date(),
        carbonCredits: 14,
      },
    ];
    setPlots(demoPlots);
    setAchievements([
      {
        id: "first-plot",
        title: "First Steps",
        description: "Mapped your first farm plot",
        icon: "🌱",
        unlockedAt: new Date(),
        points: 10,
      },
      {
        id: "multiple-plots",
        title: "Plot Master",
        description: "Mapped 3 or more farm plots",
        icon: "🏆",
        unlockedAt: new Date(),
        points: 25,
      },
    ]);
    setNotifications([
      {
        id: "n1",
        message: `Welcome ${user.name || "User"}! Demo data loaded.`,
        type: "success",
        read: false,
        createdAt: new Date(),
      },
      {
        id: "n2",
        message: "4 plots mapped totaling 18.5 acres.",
        type: "info",
        read: false,
        createdAt: new Date(),
      },
    ]);
  }, [user, plots.length]);

  const calculatePlotArea = (points: LatLngPoint[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lat * points[j].lng;
      area -= points[j].lat * points[i].lng;
    }
    return (Math.abs(area) / 2) * 0.0001;
  };

  const addPlot = (
    newPlotPoints: LatLngPoint[],
    plotName: string,
    area: number
  ) => {
    if (!newPlotPoints || newPlotPoints.length === 0) return;

    const newPlot: Plot = {
      id: `${Date.now()}`,
      points: newPlotPoints,
      name: plotName,
      area: area,
      createdAt: new Date(),
      carbonCredits: Math.floor(area * 0.5), 
    };

    setPlots((prev) => [newPlot, ...prev]);
    checkAchievements([newPlot, ...plots]);
    addNotification(
      `Plot "${plotName}" mapped successfully! Earned ${newPlot.carbonCredits} carbon credits.`,
      "success"
    );
  };

  const updateFarmDetails = (details: FarmDetails) => {
    setFarmDetails(details);
    addNotification("Farm details updated successfully!", "success");
  };

  const addNotification = (
    message: string,
    type: "success" | "info" | "warning"
  ) => {
    const notification: Notification = {
      id: `${Date.now()}`,
      message,
      type,
      read: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const checkAchievements = (currentPlots: Plot[]) => {
    const newAchievements: Achievement[] = [];
    if (
      currentPlots.length === 1 &&
      achievements.every((a) => a.id !== "first-plot")
    ) {
      newAchievements.push({
        id: "first-plot",
        title: "First Steps",
        description: "Mapped your first farm plot",
        icon: "🌱",
        unlockedAt: new Date(),
        points: 10,
      });
    }
    if (
      currentPlots.length >= 3 &&
      achievements.every((a) => a.id !== "multiple-plots")
    ) {
      newAchievements.push({
        id: "multiple-plots",
        title: "Plot Master",
        description: "Mapped 3 or more farm plots",
        icon: "🏆",
        unlockedAt: new Date(),
        points: 25,
      });
    }
    const totalArea = currentPlots.reduce((sum, plot) => sum + plot.area, 0);
    if (totalArea >= 10 && achievements.every((a) => a.id !== "large-farm")) {
      newAchievements.push({
        id: "large-farm",
        title: "Land Baron",
        description: "Total mapped area exceeds 10 acres",
        icon: "🌍",
        unlockedAt: new Date(),
        points: 50,
      });
    }

    if (newAchievements.length > 0) {
      setAchievements((prev) => [...prev, ...newAchievements]);
      newAchievements.forEach((achievement) => {
        addNotification(
          `Achievement unlocked: ${achievement.title}!`,
          "success"
        );
      });
    }
  };

  const totalCarbonCredits = useMemo(
    () =>
      plots.reduce((total, plot) => total + plot.carbonCredits, 0) -
      creditsSpent,
    [plots, creditsSpent]
  );

  const requestVisitVerification = async (data: {
    village: string;
    locationDetails: string;
    preferredDate: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    const base: Omit<VisitRequest, "status"> = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      farmerId, 
      farmerName: farmerNameState, 
      village: data.village,
      locationDetails: data.locationDetails,
      preferredDate: data.preferredDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      const payload = {
        farmerId, 
        farmerName: farmerNameState, 
        village: data.village,
        locationDetails: data.locationDetails,
        preferredDate: data.preferredDate,
      };
      const resp = await fetch(
        "https://nabard-visitor-backend.onrender.com/api/visit-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      let bodyText = "";
      try {
        bodyText = await resp.text();
      } catch {}
      if (!resp.ok) {
        addNotification("Verification request failed", "warning");
        setVisitRequests((prev) => [
          {
            ...base,
            status: "failed",
            responseMessage: bodyText || `HTTP ${resp.status}`,
          },
          ...prev,
        ]);
        return { ok: false, error: bodyText || `HTTP ${resp.status}` };
      }
      addNotification("Verification request sent successfully!", "success");
      setVisitRequests((prev) => [{ ...base, status: "pending" }, ...prev]);
      return { ok: true };
    } catch (e) {
      const message = (e as Error).message;
      addNotification("Network error sending verification request", "warning");
      setVisitRequests((prev) => [
        { ...base, status: "failed", responseMessage: message },
        ...prev,
      ]);
      return { ok: false, error: message };
    }
  };

  const purchaseItem = (
    itemName: string,
    cost: number,
    payWithCredits: boolean
  ) => {
    if (payWithCredits) {
      if (cost > totalCarbonCredits) {
        return { ok: false, error: "Not enough carbon credits" };
      }
      setCreditsSpent((prev) => prev + cost);
      addNotification(`Purchased ${itemName} for ${cost} credits`, "success");
      return { ok: true };
    }
    addNotification(`Purchased ${itemName} for ₹${cost}`, "success");
    return { ok: true };
  };

  const updateFarmerProfile = (data: {
    name?: string;
    mobileNumber?: string;
  }) => {
    if (data.name) setFarmerNameState(data.name);
    if (data.mobileNumber) setMobileNumber(data.mobileNumber);
    addNotification("Profile updated", "success");
  };

  const value = useMemo(
    () => ({
      farmerId, 
      farmerName: farmerNameState,
      mobileNumber,
      plots,
      farmDetails,
      achievements,
      notifications,
      visitRequests,
      totalCarbonCredits,
      creditsSpent,
      addPlot,
      updateFarmDetails,
      updateFarmerProfile,
      addNotification,
      markNotificationRead,
      calculatePlotArea,
      requestVisitVerification,
      purchaseItem,
    }),
    [
      farmerId,
      farmerNameState,
      mobileNumber,
      plots,
      farmDetails,
      achievements,
      notifications,
      visitRequests,
      totalCarbonCredits,
      creditsSpent,
    ]
  );

  return (
    <FarmerContext.Provider value={value}>{children}</FarmerContext.Provider>
  );
};
