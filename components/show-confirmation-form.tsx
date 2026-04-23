"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Calendar, Clock, DollarSign, Mail, Monitor, Theater, ArrowRight } from "lucide-react"
import { VENUES, DEFAULT_VENUE, DEFAULT_DIGITAL_PRICE, type VenueName } from "@/lib/config"
import type { ShowDetails } from "@/lib/types"

interface ShowConfirmationFormProps {
  initialValue?: ShowDetails | null
  onSubmit: (data: ShowDetails) => void
}

const DEFAULT_FORM: ShowDetails = {
  showTitle: "",
  showDate: "",
  venue: DEFAULT_VENUE,
  showTime: "",
  techRehearsalTime: "",
  presaleTicketPrice: 0,
  doorTicketPrice: 0,
  digitalTicket: { enabled: false, price: DEFAULT_DIGITAL_PRICE },
  producerEmail: "",
}

export function ShowConfirmationForm({ initialValue, onSubmit }: ShowConfirmationFormProps) {
  const [formData, setFormData] = useState<ShowDetails>(initialValue ?? DEFAULT_FORM)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateField = <K extends keyof ShowDetails>(field: K, value: ShowDetails[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl shadow-black/20 border-border/50">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="font-display text-xl uppercase tracking-wider text-balance flex items-center gap-2">
          <Theater className="h-5 w-5 text-primary" />
          Show Details
        </CardTitle>
        <CardDescription className="text-pretty text-sm">
          Enter the show info below. You&apos;ll review everything before anything is sent or created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="showTitle">Show Title</FieldLabel>
              <Input
                id="showTitle"
                placeholder="Enter show title"
                value={formData.showTitle}
                onChange={(e) => updateField("showTitle", e.target.value)}
                className="bg-input/50 focus:bg-input transition-colors"
                required
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="showDate">
                  <Calendar className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-muted-foreground" />
                  Show Date
                </FieldLabel>
                <Input
                  id="showDate"
                  type="date"
                  value={formData.showDate}
                  onChange={(e) => updateField("showDate", e.target.value)}
                  className="bg-input/50 focus:bg-input transition-colors"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="venue">Venue</FieldLabel>
                <Select
                  value={formData.venue}
                  onValueChange={(value: VenueName) => updateField("venue", value)}
                >
                  <SelectTrigger id="venue" className="bg-input/50">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUES.map((venue) => (
                      <SelectItem key={venue.id} value={venue.name}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="showTime">
                  <Clock className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-muted-foreground" />
                  Show Time
                </FieldLabel>
                <Input
                  id="showTime"
                  type="time"
                  value={formData.showTime}
                  onChange={(e) => updateField("showTime", e.target.value)}
                  className="bg-input/50 focus:bg-input transition-colors"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="techRehearsalTime">
                  <Clock className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-muted-foreground" />
                  Tech Rehearsal
                  <span className="text-muted-foreground font-normal ml-1 text-xs">(optional)</span>
                </FieldLabel>
                <Input
                  id="techRehearsalTime"
                  type="time"
                  value={formData.techRehearsalTime}
                  onChange={(e) => updateField("techRehearsalTime", e.target.value)}
                  className="bg-input/50 focus:bg-input transition-colors"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="presaleTicketPrice">
                  <DollarSign className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-muted-foreground" />
                  Presale Price
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon className="bg-muted/50">$</InputGroupAddon>
                  <InputGroupInput
                    id="presaleTicketPrice"
                    type="number"
                    min="0"
                    step="0.50"
                    placeholder="0.00"
                    value={formData.presaleTicketPrice || ""}
                    onChange={(e) => updateField("presaleTicketPrice", parseFloat(e.target.value) || 0)}
                    className="bg-input/50 focus:bg-input transition-colors"
                    required
                  />
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="doorTicketPrice">
                  <DollarSign className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-muted-foreground" />
                  Door Price
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon className="bg-muted/50">$</InputGroupAddon>
                  <InputGroupInput
                    id="doorTicketPrice"
                    type="number"
                    min="0"
                    step="0.50"
                    placeholder="0.00"
                    value={formData.doorTicketPrice || ""}
                    onChange={(e) => updateField("doorTicketPrice", parseFloat(e.target.value) || 0)}
                    className="bg-input/50 focus:bg-input transition-colors"
                    required
                  />
                </InputGroup>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="producerEmail">
                <Mail className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-muted-foreground" />
                Producer Email
              </FieldLabel>
              <Input
                id="producerEmail"
                type="email"
                placeholder="producer@example.com"
                value={formData.producerEmail}
                onChange={(e) => updateField("producerEmail", e.target.value)}
                className="bg-input/50 focus:bg-input transition-colors"
                required
              />
            </Field>

            <Field className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="digitalEnabled" className="text-sm font-medium flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-primary" />
                    Digital Ticket
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add an online viewing option. The livestream team handles setup separately.
                  </p>
                </div>
                <Switch
                  id="digitalEnabled"
                  checked={formData.digitalTicket.enabled}
                  onCheckedChange={(checked) =>
                    updateField("digitalTicket", { ...formData.digitalTicket, enabled: checked })
                  }
                />
              </div>

              {formData.digitalTicket.enabled && (
                <div className="pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="digitalPrice" className="text-xs mb-2 block text-muted-foreground">
                    Digital ticket price
                  </Label>
                  <InputGroup className="max-w-[160px]">
                    <InputGroupAddon className="bg-muted/50">$</InputGroupAddon>
                    <InputGroupInput
                      id="digitalPrice"
                      type="number"
                      min="0"
                      step="0.50"
                      value={formData.digitalTicket.price}
                      onChange={(e) =>
                        updateField("digitalTicket", {
                          ...formData.digitalTicket,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-input/50 focus:bg-input transition-colors"
                    />
                  </InputGroup>
                </div>
              )}
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            className="w-full font-display uppercase tracking-wider text-sm group"
            size="lg"
          >
            Review Preview
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
