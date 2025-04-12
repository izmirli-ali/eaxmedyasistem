"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  ad: z.string().min(2, {
    message: "İşletme adı en az 2 karakter olmalıdır.",
  }),
  adres: z.string().min(10, {
    message: "Adres en az 10 karakter olmalıdır.",
  }),
  telefon: z.string().min(10, {
    message: "Telefon numarası en az 10 karakter olmalıdır.",
  }),
  kategori: z.string().min(1, {
    message: "Lütfen bir kategori seçin.",
  }),
  aciklama: z.string().min(20, {
    message: "Açıklama en az 20 karakter olmalıdır.",
  }),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  harita_linki: z.string().optional(),
})

export default function IsletmeEkleForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    ad: "",
    adres: "",
    telefon: "",
    kategori: "",
    aciklama: "",
    latitude: "",
    longitude: "",
    harita_linki: "",
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ad: "",
      adres: "",
      telefon: "",
      kategori: "",
      aciklama: "",
      latitude: "",
      longitude: "",
      harita_linki: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Display the values in the console
    console.log(values)
    toast({
      title: "Başarılı!",
      description: "İşletme başarıyla eklendi.",
    })
    router.push("/dashboard")
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }))
  }

  return (
    <div className="container max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">İşletme Ekle</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="ad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İşletme Adı</FormLabel>
                <FormControl>
                  <Input placeholder="İşletme adı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="adres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adres</FormLabel>
                <FormControl>
                  <Textarea placeholder="İşletme adresi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Enlem (Latitude)</Label>
              <Input
                id="latitude"
                name="latitude"
                placeholder="Örn: 41.0082"
                value={formData.latitude || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Boylam (Longitude)</Label>
              <Input
                id="longitude"
                name="longitude"
                placeholder="Örn: 28.9784"
                value={formData.longitude || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="harita_linki">Google Harita Linki (iFrame)</Label>
            <Input
              id="harita_linki"
              name="harita_linki"
              placeholder="Google Harita Embed Linki"
              value={formData.harita_linki || ""}
              onChange={handleInputChange}
            />
            <p className="text-sm text-gray-500">
              Google Haritalar'da konumu bulun, "Paylaş" > "Haritayı yerleştir" seçeneğinden HTML kodunu kopyalayıp
              buraya yapıştırın.
            </p>
          </div>

          <FormField
            control={form.control}
            name="telefon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon Numarası</FormLabel>
                <FormControl>
                  <Input placeholder="Telefon numarası" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kategori"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bir kategori seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="restoran">Restoran</SelectItem>
                    <SelectItem value="kafe">Kafe</SelectItem>
                    <SelectItem value="otel">Otel</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aciklama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açıklama</FormLabel>
                <FormControl>
                  <Textarea placeholder="İşletme hakkında açıklama" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Kaydet</Button>
        </form>
      </Form>
    </div>
  )
}
