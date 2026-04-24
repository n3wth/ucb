"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Calendar, Clock, DollarSign, Mail, Monitor, ArrowRight, Users } from "lucide-react"
import { VENUES, DEFAULT_VENUE, DEFAULT_DIGITAL_PRICE, type VenueName } from "@/lib/config"
import { CcEmailList } from "@/components/cc-email-list"
import { loadDefaultCcEmails } from "@/lib/cc-preferences"
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
  ccEmails: [],
}

export function ShowConfirmationForm({ initialValue, onSubmit }: ShowConfirmationFormProps) {
  const [formData, setFormData] = useState<ShowDetails>(initialValue ?? DEFAULT_FORM)

  // When opening a fresh form (no initialValue), pre-fill CCs from saved defaults.
  // If the user navigated back to edit, keep whatever they already had.
  useEffect(() => {
    if (initialValue) return
    const defaults = loadDefaultCcEmails()
    if (defaults.length === 0) return
    setFormData((prev) =>
      prev.ccEmails.length === 0 ? { ...prev, ccEmails: defaults } : prev,
    )
  }, [initialValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateField = <K extends keyof ShowDetails>(field: K, value: ShowDetails[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const inputClasses = "bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-10 placeholder:text-muted-foreground"

  return (
    <Card className="w-full border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-foreground">
          Show details
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          Fill in the details below. You&apos;ll review everything before confirming.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Show title - full width, emphasized */}
          <Field>
            <FieldLabel htmlFor="showTitle" className="text-xs">Show title</FieldLabel>
            <Input
              id="showTitle"
              placeholder="The Harold Night"
              value={formData.showTitle}
              onChange={(e) => updateField("showTitle", e.target.value)}
              className={`${inputClasses} h-12 text-base`}
              required
            />
          </Field>

          {/* Date, Venue row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field>
              <FieldLabel htmlFor="showDate" className="text-xs">
                <Calendar className="inline-block h-3 w-3 mr-1.5 -mt-0.5 opacity-70" />
                Show date
              </FieldLabel>
              <Input
                id="showDate"
                type="date"
                value={formData.showDate}
                onChange={(e) => updateField("showDate", e.target.value)}
                className={inputClasses}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="venue" className="text-xs">Venue</FieldLabel>
              <Select
                value={formData.venue}
                onValueChange={(value: VenueName) => updateField("venue", value)}
              >
                <SelectTrigger id="venue" className={inputClasses}>
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

          {/* Show time, Tech rehearsal row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field>
              <FieldLabel htmlFor="showTime" className="text-xs">
                <Clock className="inline-block h-3 w-3 mr-1.5 -mt-0.5 opacity-70" />
                Show time
              </FieldLabel>
              <Input
                id="showTime"
                type="time"
                value={formData.showTime}
                onChange={(e) => updateField("showTime", e.target.value)}
                className={inputClasses}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="techRehearsalTime" className="text-xs">
                <Clock className="inline-block h-3 w-3 mr-1.5 -mt-0.5 opacity-70" />
                Tech rehearsal
                <span className="text-muted-foreground/70 font-normal ml-1">(optional)</span>
              </FieldLabel>
              <Input
                id="techRehearsalTime"
                type="time"
                value={formData.techRehearsalTime}
                onChange={(e) => updateField("techRehearsalTime", e.target.value)}
                className={inputClasses}
              />
            </Field>
          </div>

          {/* Pricing row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field>
              <FieldLabel htmlFor="presaleTicketPrice" className="text-xs">
                <DollarSign className="inline-block h-3 w-3 mr-1.5 -mt-0.5 opacity-70" />
                Presale ticket
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon className="bg-muted border-border text-muted-foreground">$</InputGroupAddon>
                <InputGroupInput
                  id="presaleTicketPrice"
                  type="number"
                  min="0"
                  step="0.50"
                  placeholder="0.00"
                  value={formData.presaleTicketPrice || ""}
                  onChange={(e) => updateField("presaleTicketPrice", parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="doorTicketPrice" className="text-xs">
                <DollarSign className="inline-block h-3 w-3 mr-1.5 -mt-0.5 opacity-70" />
                Door ticket
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon className="bg-muted border-border text-muted-foreground">$</InputGroupAddon>
                <InputGroupInput
                  id="doorTicketPrice"
                  type="number"
                  min="0"
                  step="0.50"
                  placeholder="0.00"
                  value={formData.doorTicketPrice || ""}
                  onChange={(e) => updateField("doorTicketPrice", parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  required
                />
              </InputGroup>
            </Field>
          </div>

          {/* Producer email */}
          <Field>
            <FieldLabel htmlFor="producerEmail" className="text-xs">
              <Mail className="inline-block h-3 w-3 mr-1.5 -mt-0.5 opacity-70" />
              Producer email
            </FieldLabel>
            <Input
              id="producerEmail"
              type="email"
              placeholder="producer@example.com"
              value={formData.producerEmail}
              onChange={(e) => updateField("producerEmail", e.target.value)}
              className={inputClasses}
              required
            />
          </Field>

          {/* CC emails */}
          <Field>
            <FieldLabel htmlFor="ccInput" className="text-xs">
              <Users className="inline-block h-3 w-3 mr-1.5 -mt-0.5 opacity-70" />
              CC
              <span className="text-muted-foreground/70 font-normal ml-1">(optional)</span>
            </FieldLabel>
            <CcEmailList
              inputId="ccInput"
              emails={formData.ccEmails}
              onChange={(next) => updateField("ccEmails", next)}
              emptyHint="Add addresses to CC on this confirmation. Defaults can be managed below."
            />
          </Field>

          {/* Digital ticket option */}
          <div className="rounded-lg border border-border bg-muted/40 p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="digitalEnabled" className="text-sm font-medium flex items-center gap-2 cursor-pointer text-foreground">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  Digital ticket
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  Add a livestream option for remote viewers. The stream setup is handled separately.
                </p>
              </div>
              <Switch
                id="digitalEnabled"
                checked={formData.digitalTicket.enabled}
                onCheckedChange={(checked) =>
                  updateField("digitalTicket", { ...formData.digitalTicket, enabled: checked })
                }
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30"
              />
            </div>

            {formData.digitalTicket.enabled && (
              <div className="pt-4 border-t border-border/40 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label htmlFor="digitalPrice" className="text-xs text-muted-foreground mb-2 block">
                  Stream ticket price
                </Label>
                <InputGroup className="max-w-32">
                  <InputGroupAddon className="bg-muted border-border text-muted-foreground">$</InputGroupAddon>
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
                    className={inputClasses}
                  />
                </InputGroup>
              </div>
            )}
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-11 group"
            size="lg"
          >
            Continue to review
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
