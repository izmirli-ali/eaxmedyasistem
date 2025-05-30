"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { isletmeEkle } from "@/app/actions/isletme"
import { useRouter } from "next/navigation"

// Form şeması
const formSchema = z.object({
  isletme_adi: z.string().min(2, "İşletme adı en az 2 karakter olmalıdır"),
  adres: z.string().min(10, "Adres en az 10 karakter olmalıdır"),
  telefon: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  website: z.string().url("Geçerli bir website adresi giriniz").optional(),
  aciklama: z.string().min(50, "Açıklama en az 50 karakter olmalıdır"),
  kategori: z.string(),
  sehir: z.string(),
  ilce: z.string(),
  enlem: z.string(),
  boylam: z.string(),
  calisma_saatleri: z.string(),
  ozellikler: z.array(z.string()),
  resimler: z.array(z.string()),
})

export default function IsletmeEklePage() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isletme_adi: "",
      adres: "",
      telefon: "",
      email: "",
      website: "",
      aciklama: "",
      kategori: "",
      sehir: "",
      ilce: "",
      enlem: "",
      boylam: "",
      calisma_saatleri: "",
      ozellikler: [],
      resimler: [],
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const result = await isletmeEkle(data)
      
      if (result.success) {
        toast.success("İşletme başarıyla eklendi")
        form.reset()
        router.push("/dashboard/isletmeler")
      } else {
        toast.error(result.error || "İşletme eklenirken bir hata oluştu")
      }
    } catch (error) {
      console.error("Form gönderim hatası:", error)
      toast.error("Bir hata oluştu")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Yeni İşletme Ekle</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isletme_adi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İşletme Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="İşletme adını giriniz" {...field} />
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
                      <Textarea placeholder="Adresi giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefon numarasını giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="E-posta adresini giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Website adresini giriniz" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="restoran">Restoran</SelectItem>
                        <SelectItem value="kafe">Kafe</SelectItem>
                        <SelectItem value="otel">Otel</SelectItem>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="diger">Diğer</SelectItem>
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
                      <Textarea placeholder="İşletme hakkında açıklama giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            İşletmeyi Ekle
          </Button>
        </form>
      </Form>
    </div>
  )
}
