import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MailIcon, MapPinIcon, MessageCircle, PhoneIcon } from "lucide-react";

const contactDetails = [
  {
    icon: MailIcon,
    title: "Email",
    description: "Our friendly team is here to help.",
    link: "mailto:xyz@gmail.com",
    text: "xyz@gmail.com",
  },
  {
    icon: MessageCircle,
    title: "Live chat",
    description: "Our friendly team is here to help.",
    link: "#",
    text: "Start new chat",
  },
  {
    icon: MapPinIcon,
    title: "Office",
    description: "Come say hello at our office HQ.",
    link: "https://map.google.com",
    text: (
      <>
        XYZ <br /> ABCD
      </>
    ),
  },
  {
    icon: PhoneIcon,
    title: "Phone",
    description: "Mon-Fri from 8am to 5pm.",
    link: "tel:+91 9999999999",
    text: "+1 (555) 000-0000",
  },
];

const ContactPage = () => (
  <div className="flex items-center justify-center py-17">
    <div className="w-full max-w-screen-xl mx-auto px-6 xl:px-0">
      <b className="text-muted-foreground">Contact Us</b>
      <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
        Chat to our friendly team
      </h2>
      <p className="mt-3 text-base sm:text-lg">
        We&apos;d love to hear from you. Please fill out this form or shoot us an email.
      </p>

      <div className="mt-12 grid lg:grid-cols-2 gap-16 md:gap-10">
        {/* Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
          {contactDetails.map((item, idx) => (
            <div key={idx}>
              <div className="h-12 w-12 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                <item.icon />
              </div>
              <h3 className="mt-6 font-semibold text-xl">{item.title}</h3>
              <p className="my-2.5 text-muted-foreground">{item.description}</p>
              <a
                className="font-medium text-primary"
                href={item.link}
                target={item.title === "Office" ? "_blank" : undefined}
                rel={item.title === "Office" ? "noopener noreferrer" : undefined}
              >
                {item.text}
              </a>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <Card>
          <CardContent className="p-6 md:p-10">
            <form>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input placeholder="First name" id="firstName" className="mt-1.5" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input placeholder="Last name" id="lastName" className="mt-1.5" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" placeholder="Email" id="email" className="mt-1.5" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Message" className="mt-1.5" rows={6} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Checkbox id="acceptTerms" />
                  <Label htmlFor="acceptTerms">
                    You agree to our{" "}
                    <a href="#" className="underline">
                      terms and conditions
                    </a>
                    .
                  </Label>
                </div>
              </div>
              <Button className="mt-6 w-full" size="lg">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default ContactPage;
