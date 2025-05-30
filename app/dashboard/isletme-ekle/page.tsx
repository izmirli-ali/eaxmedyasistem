"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { isletmeEkle } from "@/app/actions/isletme"

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
      } else {
        toast.error("İşletme eklenirken bir hata oluştu")
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
              <Form.Field
                control={form.control}
                name="isletme_adi"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>İşletme Adı</Form.Label>
                    <Form.Control>
                      <Input placeholder="İşletme adını giriniz" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="adres"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Adres</Form.Label>
                    <Form.Control>
                      <Textarea placeholder="Adresi giriniz" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="telefon"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Telefon</Form.Label>
                    <Form.Control>
                      <Input placeholder="Telefon numarasını giriniz" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>E-posta</Form.Label>
                    <Form.Control>
                      <Input type="email" placeholder="E-posta adresini giriniz" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <div className="space-y-4">
              <Form.Field
                control={form.control}
                name="website"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Website</Form.Label>
                    <Form.Control>
                      <Input placeholder="Website adresini giriniz" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Kategori</Form.Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Kategori seçiniz" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="restoran">Restoran</Select.Item>
                        <Select.Item value="kafe">Kafe</Select.Item>
                        <Select.Item value="otel">Otel</Select.Item>
                        <Select.Item value="market">Market</Select.Item>
                        <Select.Item value="diger">Diğer</Select.Item>
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="aciklama"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Açıklama</Form.Label>
                    <Form.Control>
                      <Textarea placeholder="İşletme hakkında açıklama giriniz" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
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
