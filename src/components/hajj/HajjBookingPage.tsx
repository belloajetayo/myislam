import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Plane, 
  Hotel, 
  Users, 
  Calendar,
  Star,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface HajjPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  hotelMakkah: string;
  hotelMadinah: string;
  makkahNights: number;
  madinahNights: number;
}

const packages: HajjPackage[] = [
  {
    id: "economy",
    name: "Economy Package",
    price: 5999,
    duration: "15 Days",
    features: ["Return Flights", "Visa Processing", "3-Star Hotels", "Ground Transport", "Guided Tours"],
    hotelMakkah: "3-Star (2km from Haram)",
    hotelMadinah: "3-Star (1km from Masjid)",
    makkahNights: 8,
    madinahNights: 5
  },
  {
    id: "standard",
    name: "Standard Package",
    price: 8499,
    duration: "18 Days",
    features: ["Return Flights", "Visa Processing", "4-Star Hotels", "Private Transport", "Guided Tours", "Meals Included"],
    hotelMakkah: "4-Star (500m from Haram)",
    hotelMadinah: "4-Star (300m from Masjid)",
    makkahNights: 10,
    madinahNights: 6
  },
  {
    id: "premium",
    name: "Premium Package",
    price: 12999,
    duration: "21 Days",
    features: ["Business Class Flights", "VIP Visa Processing", "5-Star Hotels", "Private Luxury Transport", "Personal Guide", "All Meals", "Ziyarat Tours"],
    hotelMakkah: "5-Star (Haram View)",
    hotelMadinah: "5-Star (Masjid View)",
    makkahNights: 12,
    madinahNights: 7
  }
];

const HajjBookingPage = () => {
  const [selectedPackage, setSelectedPackage] = useState<HajjPackage | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    passportNumber: "",
    passportExpiry: "",
    nationality: "",
    dateOfBirth: "",
    gender: "",
    emergencyContact: "",
    emergencyPhone: "",
    dietaryRequirements: "",
    medicalConditions: "",
    roomPreference: "",
    numberOfPilgrims: "1"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageSelect = (pkg: HajjPackage) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleSubmit = () => {
    toast.info("Payment system coming soon! We'll contact you to complete your booking.", {
      duration: 5000
    });
  };

  const totalPrice = selectedPackage 
    ? selectedPackage.price * parseInt(formData.numberOfPilgrims || "1")
    : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-1 mx-1 ${step > s ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-8 text-sm text-muted-foreground">
        <span className={step >= 1 ? "text-foreground font-medium" : ""}>Select Package</span>
        <span className={step >= 2 ? "text-foreground font-medium" : ""}>Your Details</span>
        <span className={step >= 3 ? "text-foreground font-medium" : ""}>Payment</span>
      </div>

      {/* Step 1: Package Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Choose Your Hajj Package</h2>
            <p className="text-muted-foreground">Complete packages with flights, accommodation & guided services</p>
          </div>
          
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPackage?.id === pkg.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handlePackageSelect(pkg)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{pkg.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {pkg.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${pkg.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">per person</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{pkg.hotelMakkah}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{pkg.hotelMadinah}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {pkg.features.slice(0, 4).map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {pkg.features.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{pkg.features.length - 4} more
                    </Badge>
                  )}
                </div>

                <Button className="w-full mt-4" onClick={() => handlePackageSelect(pkg)}>
                  Select This Package
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 2: Personal Details */}
      {step === 2 && selectedPackage && (
        <div className="space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-foreground">{selectedPackage.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPackage.duration}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pilgrim Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Number of Pilgrims</Label>
                <Select 
                  value={formData.numberOfPilgrims} 
                  onValueChange={(v) => handleInputChange("numberOfPilgrims", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} Pilgrim{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />
              <p className="text-sm text-muted-foreground">Primary Contact Details</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="As in passport"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="As in passport"
                  />
                </div>
              </div>

              <div>
                <Label>Email Address</Label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Passport Number</Label>
                  <Input 
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Passport Expiry</Label>
                  <Input 
                    type="date"
                    value={formData.passportExpiry}
                    onChange={(e) => handleInputChange("passportExpiry", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nationality</Label>
                  <Input 
                    value={formData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input 
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(v) => handleInputChange("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />
              <p className="text-sm text-muted-foreground">Emergency Contact</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Name</Label>
                  <Input 
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input 
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  />
                </div>
              </div>

              <Separator />
              <p className="text-sm text-muted-foreground">Additional Information</p>

              <div>
                <Label>Room Preference</Label>
                <Select 
                  value={formData.roomPreference} 
                  onValueChange={(v) => handleInputChange("roomPreference", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quad">Quad Sharing (4 per room)</SelectItem>
                    <SelectItem value="triple">Triple Sharing (3 per room)</SelectItem>
                    <SelectItem value="double">Double Sharing (2 per room)</SelectItem>
                    <SelectItem value="single">Single Room (+$1,500)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dietary Requirements</Label>
                <Input 
                  value={formData.dietaryRequirements}
                  onChange={(e) => handleInputChange("dietaryRequirements", e.target.value)}
                  placeholder="e.g., Vegetarian, Allergies"
                />
              </div>

              <div>
                <Label>Medical Conditions</Label>
                <Textarea 
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                  placeholder="Any medical conditions we should be aware of"
                  rows={3}
                />
              </div>

              <Button className="w-full" onClick={() => setStep(3)}>
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && selectedPackage && (
        <div className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-foreground">{selectedPackage.name}</span>
                <span className="text-foreground">${selectedPackage.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Number of Pilgrims</span>
                <span>× {formData.numberOfPilgrims}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {selectedPackage.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Makkah: {selectedPackage.hotelMakkah} ({selectedPackage.makkahNights} nights)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Madinah: {selectedPackage.hotelMadinah} ({selectedPackage.madinahNights} nights)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cardholder Name</Label>
                <Input placeholder="Name on card" />
              </div>
              <div>
                <Label>Card Number</Label>
                <Input placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Expiry Date</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input placeholder="123" type="password" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Lock className="w-4 h-4" />
                <span>Your payment information is encrypted and secure</span>
              </div>

              <Button className="w-full h-12 text-lg" onClick={handleSubmit}>
                <Lock className="w-5 h-5 mr-2" />
                Pay ${totalPrice.toLocaleString()} USD
              </Button>

              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-4 h-4" />
                  <span>Trusted Provider</span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep(2)}
              >
                ← Back to Details
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HajjBookingPage;
