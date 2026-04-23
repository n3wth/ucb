"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Calendar, Clock, DollarSign, Mail, Video, Theater } from "lucide-react"
import type { ShowDetails } from "@/lib/types"

interface ShowConfirmationFormProps {
  onSubmit: (data: ShowDetails) => Promise<void>
  isLoading: boolean
}

export function ShowConfirmationForm({ onSubmit, isLoading }: ShowConfirmationFormProps) {
  const [formData, setFormData] = useState<ShowDetails>({
    showTitle: "",
    showDate: "",
    venue: "UCB Franklin",
    showTime: "",
    techRehearsalTime: "",
    presaleTicketPrice: 0,
    doorTicketPrice: 0,
    liveStream: false,
    producerEmail: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const updateField = <K extends keyof ShowDetails>(field: K, value: ShowDetails[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-balance">New Show Confirmation</CardTitle>
        <CardDescription className="text-pretty">
          Enter the show details below to automatically generate confirmation emails, calendar events, and Drive folders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="showTitle">
                <Theater className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
                Show Title
              </FieldLabel>
              <Input
                id="showTitle"
                placeholder="Enter show title"
                value={formData.showTitle}
                onChange={(e) => updateField("showTitle", e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="showDate">
                  <Calendar className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
                  Show Date
                </FieldLabel>
                <Input
                  id="showDate"
                  type="date"
                  value={formData.showDate}
                  onChange={(e) => updateField("showDate", e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="venue">Venue</FieldLabel>
                <Select
                  value={formData.venue}
                  onValueChange={(value: "UCB Franklin" | "UCB Annex") => updateField("venue", value)}
                >
                  <SelectTrigger id="venue">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UCB Franklin">UCB Franklin</SelectItem>
                    <SelectItem value="UCB Annex">UCB Annex</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="showTime">
                  <Clock className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
                  Show Time
                </FieldLabel>
                <Input
                  id="showTime"
                  type="time"
                  value={formData.showTime}
                  onChange={(e) => updateField("showTime", e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="techRehearsalTime">
                  <Clock className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
                  Tech Rehearsal Time
                  <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                </FieldLabel>
                <Input
                  id="techRehearsalTime"
                  type="time"
                  value={formData.techRehearsalTime}
                  onChange={(e) => updateField("techRehearsalTime", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="presaleTicketPrice">
                  <DollarSign className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
                  Presale Ticket Price
                </FieldLabel>
                <Input
                  id="presaleTicketPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.presaleTicketPrice || ""}
                  onChange={(e) => updateField("presaleTicketPrice", parseFloat(e.target.value) || 0)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="doorTicketPrice">
                  <DollarSign className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
                  Door Ticket Price
                </FieldLabel>
                <Input
                  id="doorTicketPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.doorTicketPrice || ""}
                  onChange={(e) => updateField("doorTicketPrice", parseFloat(e.target.value) || 0)}
                  required
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="producerEmail">
                <Mail className="inline-block h-4 w-4 mr-1.5 -mt-0.5" />
                Producer Email
              </FieldLabel>
              <Input
                id="producerEmail"
                type="email"
                placeholder="producer@example.com"
                value={formData.producerEmail}
                onChange={(e) => updateField("producerEmail", e.target.value)}
                required
              />
            </Field>

            <Field className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="liveStream" className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Live Stream
                </Label>
                <p className="text-sm text-muted-foreground">
                  Will this show be streamed live?
                </p>
              </div>
              <Switch
                id="liveStream"
                checked={formData.liveStream}
                onCheckedChange={(checked) => updateField("liveStream", checked)}
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Processing...
              </>
            ) : (
              "Generate Confirmation"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
