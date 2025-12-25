import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, GraduationCap, MapPin, Heart, ArrowRight, Check, Search, Plus } from "lucide-react";
import { interests as interestsData } from "@/data/colleges";
import { fetchColleges, addCollege, type College } from "@/lib/colleges";
import { fetchCities, addCity as addCityToDb, type City } from "@/lib/cities";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isStudent, setIsStudent] = useState<boolean | null>(null);
  const [college, setCollege] = useState("");
  const [selectedCollegeName, setSelectedCollegeName] = useState("");
  const [city, setCity] = useState("");
  const [eventCity, setEventCity] = useState(""); // City preference for events
  const [eventCitySearch, setEventCitySearch] = useState("");
  const [showEventCityDropdown, setShowEventCityDropdown] = useState(false);
  const eventCityDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  // Database colleges and cities
  const [colleges, setColleges] = useState<College[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  
  // Add college dialog
  const [showAddCollegeDialog, setShowAddCollegeDialog] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeCity, setNewCollegeCity] = useState("");
  const [newCollegeCitySearch, setNewCollegeCitySearch] = useState("");
  const [showNewCollegeCityDropdown, setShowNewCollegeCityDropdown] = useState(false);
  const [newCollegeType, setNewCollegeType] = useState("Other");
  const [isAddingCollege, setIsAddingCollege] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateProfile } = useAuth();
  
  const collegeDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const newCollegeCityDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch colleges from database on mount
  useEffect(() => {
    async function loadColleges() {
      setIsLoadingColleges(true);
      const data = await fetchColleges();
      setColleges(data);
      setIsLoadingColleges(false);
    }
    loadColleges();
  }, []);

  // Fetch cities from database on mount
  useEffect(() => {
    async function loadCities() {
      setIsLoadingCities(true);
      const data = await fetchCities();
      setCities(data);
      setIsLoadingCities(false);
    }
    loadCities();
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target as Node)) {
        setShowCollegeDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (newCollegeCityDropdownRef.current && !newCollegeCityDropdownRef.current.contains(event.target as Node)) {
        setShowNewCollegeCityDropdown(false);
      }
      if (eventCityDropdownRef.current && !eventCityDropdownRef.current.contains(event.target as Node)) {
        setShowEventCityDropdown(false);
      }
    }

    if (showCollegeDropdown || showCityDropdown || showNewCollegeCityDropdown || showEventCityDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCollegeDropdown, showCityDropdown, showNewCollegeCityDropdown, showEventCityDropdown]);

  // Filter event cities based on search
  const filteredEventCities = useMemo(() => {
    if (!eventCitySearch.trim()) return cities;
    const searchLower = eventCitySearch.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(searchLower));
  }, [eventCitySearch, cities]);

  // Filter colleges based on search
  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return colleges;
    const searchLower = collegeSearch.toLowerCase();
    return colleges.filter(c => 
      c.name.toLowerCase().includes(searchLower) || 
      c.city.toLowerCase().includes(searchLower) ||
      c.type.toLowerCase().includes(searchLower)
    );
  }, [collegeSearch, colleges]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const searchLower = citySearch.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(searchLower));
  }, [citySearch, cities]);

  // Filter cities for add college dialog
  const filteredNewCollegeCities = useMemo(() => {
    if (!newCollegeCitySearch.trim()) return cities;
    const searchLower = newCollegeCitySearch.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(searchLower));
  }, [newCollegeCitySearch, cities]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleAddCollege = async () => {
    if (!newCollegeName.trim() || !newCollegeCity.trim()) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsAddingCollege(true);
    
    // Check if city exists, if not add it first
    let cityName = newCollegeCity.trim();
    const existingCity = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (!existingCity) {
      const newCity = await addCityToDb(cityName);
      if (newCity) {
        setCities(prev => [...prev, newCity]);
        cityName = newCity.name; // Use the DB-returned city name
      }
    } else {
      cityName = existingCity.name; // Use existing city name
    }
    
    const result = await addCollege(newCollegeName, cityName, newCollegeType);
    setIsAddingCollege(false);

    if (result.success && result.college) {
      toast({
        title: "College added!",
        description: "Your college has been added to our database.",
      });
      // Refresh colleges list
      const updatedColleges = await fetchColleges();
      setColleges(updatedColleges);
      // Select the newly added college
      setCollege(result.college.id);
      setSelectedCollegeName(result.college.name);
      setCollegeSearch(result.college.name);
      setShowAddCollegeDialog(false);
      setNewCollegeName("");
      setNewCollegeCity("");
      setNewCollegeType("Other");
    } else {
      toast({
        title: "Failed to add college",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (isStudent && !college) {
        toast({
          title: "Please select your college",
          variant: "destructive",
        });
        return;
      }
      if (!isStudent && !city) {
        toast({
          title: "Please select your city",
          variant: "destructive",
        });
        return;
      }
      // For students, set default event city to college city
      if (isStudent) {
        const selectedCollege = colleges.find(c => c.id === college);
        if (selectedCollege) {
          setEventCity(selectedCollege.city);
          setEventCitySearch(selectedCollege.city);
        }
      } else {
        // For non-students, set default event city to their city
        setEventCity(city);
        setEventCitySearch(city);
      }
      // Go to event city selection (step 2)
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!eventCity) {
        toast({
          title: "Please select a city",
          variant: "destructive",
        });
        return;
      }
      // Go to interests (step 3)
      setStep(3);
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    if (selectedInterests.length < 2) {
      toast({
        title: "Select at least 2 interests",
        description: "This helps us connect you with the right people.",
        variant: "destructive",
      });
      return;
    }

    // Get the selected college name and city from the colleges array
    const selectedCollege = colleges.find(c => c.id === college);
    const selectedInterestNames = selectedInterests.map(id => {
      const interest = interestsData.find(i => i.id === id);
      return interest?.name || id;
    });

    // Use event city for city preference
    if (!eventCity) {
      toast({
        title: "City is required",
        description: "Please ensure a city is selected.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfile({
      college: isStudent ? (selectedCollege?.name || college) : null,
      city: eventCity, // Use selected event city
      interests: selectedInterestNames,
      is_student: isStudent,
    } as any);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile complete! 🎉",
        description: "Welcome to your community.",
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md border-border/50 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden glow-primary mb-4">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <CardTitle className="font-display text-2xl">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground text-sm">
            Step {step} of 3
          </p>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step
                    ? "w-6 bg-primary"
                    : s < step
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Student or Non-Student */}
          {step === 1 && isStudent === null && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Are you a student?</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This helps us show you the most relevant communities.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => setIsStudent(true)}
                >
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <span className="font-semibold">Yes, I'm a Student</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => setIsStudent(false)}
                >
                  <MapPin className="w-8 h-8 text-accent" />
                  <span className="font-semibold">Not a Student</span>
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: College (for students) */}
          {step === 1 && isStudent === true && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Select Your Campus</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                This helps us connect you with students from your college.
              </p>
              
              {/* Custom Search Input */}
              <div className="relative" ref={collegeDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search college, city or type..."
                    value={collegeSearch}
                    onChange={(e) => {
                      setCollegeSearch(e.target.value);
                      setShowCollegeDropdown(true);
                    }}
                    onFocus={() => setShowCollegeDropdown(true)}
                    className="pl-9"
                  />
                </div>
                
                {/* Dropdown Results */}
                {showCollegeDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      {isLoadingColleges ? (
                        <div className="px-4 py-8 text-sm text-center text-muted-foreground">
                          Loading colleges...
                        </div>
                      ) : filteredColleges.length > 0 ? (
                        filteredColleges.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setCollege(c.id);
                              setSelectedCollegeName(c.name);
                              setCollegeSearch(c.name);
                              setShowCollegeDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2 border-b border-border last:border-b-0"
                          >
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                              {c.type}
                            </Badge>
                            <span className="text-sm truncate">{c.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto shrink-0">{c.city}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-sm text-center space-y-3">
                          <p className="text-muted-foreground">
                            College not found?
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowCollegeDropdown(false);
                              setShowAddCollegeDialog(true);
                            }}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your College
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected College Display */}
              {selectedCollegeName && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{selectedCollegeName}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsStudent(null)} className="flex-1">
                  Back
                </Button>
                <Button 
                  variant="glow" 
                  className="flex-1" 
                  onClick={handleNext}
                  disabled={!college}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: City (for non-students) */}
          {step === 1 && isStudent === false && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-display font-semibold">Select Your City</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect with communities in your city.
              </p>
              <div className="relative" ref={cityDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search and select your city..."
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    className="pl-9"
                  />
                </div>
                {showCityDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {isLoadingCities ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading cities...
                      </div>
                    ) : filteredCities.length > 0 ? (
                      filteredCities.map((c) => (
                        <div
                          key={c.id}
                          className="px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border last:border-0"
                          onClick={() => {
                            setCity(c.name);
                            setCitySearch(c.name);
                            setShowCityDropdown(false);
                          }}
                        >
                          <p className="font-medium text-foreground">{c.name}</p>
                        </div>
                      ))
                    ) : citySearch.trim() ? (
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground text-center mb-3">
                          City not found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={async () => {
                            const newCity = await addCityToDb(citySearch.trim());
                            if (newCity) {
                              setCity(newCity.name);
                              setCitySearch(newCity.name);
                              setCities(prev => [...prev, newCity]);
                              setShowCityDropdown(false);
                              toast({
                                title: "City Added",
                                description: `${newCity.name} has been added to the database.`,
                              });
                            }
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add "{citySearch.trim()}"
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-center text-muted-foreground">
                        Start typing to search for a city
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsStudent(null)} className="flex-1">
                  Back
                </Button>
                <Button 
                  variant="glow" 
                  className="flex-1" 
                  onClick={handleNext}
                  disabled={!city}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Event City Selection */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-display font-semibold">Which city's events do you want to see?</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                You can change this later in your profile settings.
              </p>
              
              <div className="relative" ref={eventCityDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a city..."
                    value={eventCitySearch}
                    onChange={(e) => {
                      setEventCitySearch(e.target.value);
                      setShowEventCityDropdown(true);
                    }}
                    onFocus={() => setShowEventCityDropdown(true)}
                    className="pl-9"
                  />
                </div>
                
                {showEventCityDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      {isLoadingCities ? (
                        <div className="px-4 py-6 text-sm text-center text-muted-foreground">
                          Loading cities...
                        </div>
                      ) : filteredEventCities.length > 0 ? (
                        filteredEventCities.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setEventCity(c.name);
                              setEventCitySearch(c.name);
                              setShowEventCityDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
                          >
                            <span className="text-sm">{c.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-sm text-center text-muted-foreground">
                          City not found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {eventCity && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{eventCity}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  variant="glow" 
                  className="flex-1" 
                  onClick={handleNext}
                  disabled={!eventCity}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 text-foreground">
                <Heart className="w-5 h-5 text-secondary" />
                <h3 className="font-display font-semibold">Your Interests</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Select at least 2 interests to find your community.
              </p>
              <div className="flex flex-wrap gap-2">
                {interestsData.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant={selectedInterests.includes(interest.id) ? "default" : "interest"}
                    className="cursor-pointer text-sm py-2 px-3 transition-all"
                    onClick={() => toggleInterest(interest.id)}
                  >
                    {selectedInterests.includes(interest.id) && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    <span className="mr-1">{interest.emoji}</span>
                    {interest.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {selectedInterests.length} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  variant="glow" 
                  className="flex-1" 
                  onClick={handleComplete}
                  disabled={isLoading || selectedInterests.length < 2}
                >
                  {isLoading ? "Saving..." : "Complete"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add College Dialog */}
      <Dialog open={showAddCollegeDialog} onOpenChange={setShowAddCollegeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New College
            </DialogTitle>
            <DialogDescription>
              Can't find your college? Add it to our database and help other students discover it too!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="college-name">College Name *</Label>
              <Input
                id="college-name"
                placeholder="e.g., ABC Institute of Technology"
                value={newCollegeName}
                onChange={(e) => setNewCollegeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-city">City *</Label>
              <div className="relative" ref={newCollegeCityDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="college-city"
                    placeholder="Search and select city..."
                    value={newCollegeCitySearch}
                    onChange={(e) => {
                      setNewCollegeCitySearch(e.target.value);
                      setShowNewCollegeCityDropdown(true);
                    }}
                    onFocus={() => setShowNewCollegeCityDropdown(true)}
                    className="pl-9"
                  />
                </div>
                {showNewCollegeCityDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {isLoadingCities ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading cities...
                      </div>
                    ) : filteredNewCollegeCities.length > 0 ? (
                      filteredNewCollegeCities.map((c) => (
                        <div
                          key={c.id}
                          className="px-4 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border last:border-0"
                          onClick={() => {
                            setNewCollegeCity(c.name);
                            setNewCollegeCitySearch(c.name);
                            setShowNewCollegeCityDropdown(false);
                          }}
                        >
                          <p className="font-medium text-foreground">{c.name}</p>
                        </div>
                      ))
                    ) : newCollegeCitySearch.trim() ? (
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground text-center mb-3">
                          City not found
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={async () => {
                            const newCity = await addCityToDb(newCollegeCitySearch.trim());
                            if (newCity) {
                              setNewCollegeCity(newCity.name);
                              setNewCollegeCitySearch(newCity.name);
                              setCities(prev => [...prev, newCity]);
                              setShowNewCollegeCityDropdown(false);
                              toast({
                                title: "City Added",
                                description: `${newCity.name} has been added to the database.`,
                              });
                            }
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add "{newCollegeCitySearch.trim()}"
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-center text-muted-foreground">
                        Start typing to search for a city
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="college-type">Type</Label>
              <Select value={newCollegeType} onValueChange={setNewCollegeType}>
                <SelectTrigger id="college-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IIT">IIT</SelectItem>
                  <SelectItem value="NIT">NIT</SelectItem>
                  <SelectItem value="IIIT">IIIT</SelectItem>
                  <SelectItem value="IIM">IIM</SelectItem>
                  <SelectItem value="AIIMS">AIIMS</SelectItem>
                  <SelectItem value="IISER">IISER</SelectItem>
                  <SelectItem value="Central">Central University</SelectItem>
                  <SelectItem value="State">State University</SelectItem>
                  <SelectItem value="Private">Private University</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddCollegeDialog(false);
                setNewCollegeName("");
                setNewCollegeCity("");
                setNewCollegeType("Other");
              }}
              disabled={isAddingCollege}
            >
              Cancel
            </Button>
            <Button
              variant="glow"
              onClick={handleAddCollege}
              disabled={isAddingCollege || !newCollegeName.trim() || !newCollegeCity.trim()}
            >
              {isAddingCollege ? "Adding..." : "Add College"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
