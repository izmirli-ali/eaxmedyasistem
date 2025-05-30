"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Plus, Check, X, AlertTriangle, Download, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { NAPConsistencyService, type NAPData, type NAPPlatform } from "@/lib/nap-consistency"

interface NAPConsistencyCheckerProps {
  businessId: string
}

export function NAPConsistencyChecker({ businessId }: NAPConsistencyCheckerProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [napData, setNapData] = useState<NAPData | null>(null)
  const [platforms, setPlatforms] = useState<NAPPlatform[]>([])
  const [newPlatform, setNewPlatform] = useState({ name: "", url: "" })
  const [addingPlatform, setAddingPlatform] = useState(false)
  const [report, setReport] = useState<{
    consistentCount: number
    inconsistentCount: number
    notCheckedCount: number
    totalPlatforms: number
    consistencyScore: number
  } | null>(null)

  const napService = NAPConsistencyService.getInstance()

  // NAP verilerini ve platformları yükle
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // NAP verilerini al
        const napData = await napService.getBusinessNAP(businessId)
        setNapData(napData)

        // Platformları al
        const platforms = await napService.getTrackedPlatforms(businessId)
        setPlatforms(platforms)

        // Rapor oluştur
        const report = await napService.generateConsistencyReport(businessId)
        setReport(report)
      } catch (error) {
        console.error("NAP verileri yüklenirken hata:", error)
        toast({
          title: "Hata",
          description: "NAP verileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [businessId, toast])

  // Yeni platform ekle
  const handleAddPlatform = async () => {
    if (!newPlatform.name || !newPlatform.url) {
      toast({
        title: "Hata",
        description: "Platform adı ve URL'si gereklidir.",
        variant: "destructive",
      })
      return
    }

    try {
      setAddingPlatform(true)

      // URL formatını kontrol et
      if (!newPlatform.url.startsWith("http")) {
        setNewPlatform((prev) => ({ ...prev, url: `https://${prev.url}` }))
      }

      // Platform ekle
      const platform = await napService.addPlatform(businessId, {
        name: newPlatform.name,
        url: newPlatform.url,
        napData: napData!,
      })

      if (platform) {
        setPlatforms((prev) => [...prev, platform])
        setNewPlatform({ name: "", url: "" })

        toast({
          title: "Başarılı",
          description: "Platform başarıyla eklendi.",
        })

        // Raporu güncelle
        const report = await napService.generateConsistencyReport(businessId)
        setReport(report)
      }
    } catch (error) {
      console.error("Platform eklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Platform eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setAddingPlatform(false)
    }
  }

  // Platform tutarlılığını güncelle
  const handleUpdateConsistency = async (platformId: string, isConsistent: boolean) => {
    try {
      await napService.updatePlatformConsistency(platformId, isConsistent)

      // Platformları güncelle
      setPlatforms((prev) =>
        prev.map((p) => (p.id === platformId ? { ...p, isConsistent, lastChecked: new Date() } : p)),
      )

      toast({
        title: "Başarılı",
        description: `Platform durumu "${isConsistent ? "tutarlı" : "tutarsız"}" olarak güncellendi.`,
      })

      // Raporu güncelle
      const report = await napService.generateConsistencyReport(businessId)
      setReport(report)
    } catch (error) {
      console.error("Platform tutarlılığı güncellenirken hata:", error)
      toast({
        title: "Hata",
        description: "Platform tutarlılığı güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // NAP verilerini kopyala
  const handleCopyNAP = (format: "csv" | "json" | "html") => {
    if (!napData) return

    let content = ""

    switch (format) {
      case "csv":
        content = napService.exportNAPDataToCSV(napData)
        break
      case "json":
        content = napService.exportNAPDataToJSON(napData)
        break
      case "html":
        content = napService.exportNAPDataToHTML(napData)
        break
    }

    navigator.clipboard.writeText(content)

    toast({
      title: "Kopyalandı",
      description: `NAP verileri ${format.toUpperCase()} formatında kopyalandı.`,
    })
  }

  // NAP verilerini indir
  const handleDownloadNAP = (format: "csv" | "json" | "html") => {
    if (!napData) return

    let content = ""
    let mimeType = ""
    let extension = ""

    switch (format) {
      case "csv":
        content = napService.exportNAPDataToCSV(napData)
        mimeType = "text/csv"
        extension = "csv"
        break
      case "json":
        content = napService.exportNAPDataToJSON(napData)
        mimeType = "application/json"
        extension = "json"
        break
      case "html":
        content = napService.exportNAPDataToHTML(napData)
        mimeType = "text/html"
        extension = "html"
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nap-data.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!napData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>
              İşletme NAP verileri bulunamadı. Lütfen işletme bilgilerini güncelleyin.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>NAP Tutarlılığı Kontrolü</CardTitle>
        <CardDescription>
          İşletme bilgilerinizin (İsim, Adres, Telefon) farklı platformlarda tutarlı olması, yerel SEO için kritik öneme
          sahiptir.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="platforms">Platformlar</TabsTrigger>
            <TabsTrigger value="export">Dışa Aktar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* NAP Bilgileri */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">İşletme NAP Bilgileri</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">İsim:</span>
                    <span className="font-medium">{napData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Adres:</span>
                    <span className="font-medium">{napData.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefon:</span>
                    <span className="font-medium">{napData.phone}</span>
                  </div>
                  {napData.website && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Web Sitesi:</span>
                      <span className="font-medium">{napData.website}</span>
                    </div>
                  )}
                  {napData.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">E-posta:</span>
                      <span className="font-medium">{napData.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tutarlılık Skoru */}
              {report && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Tutarlılık Skoru</h3>
                    <Badge
                      variant={
                        report.consistencyScore >= 80
                          ? "success"
                          : report.consistencyScore >= 50
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {Math.round(report.consistencyScore)}%
                    </Badge>
                  </div>

                  <Progress value={report.consistencyScore} className="h-2" />

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{report.consistentCount}</div>
                      <div className="text-sm text-green-700">Tutarlı</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{report.inconsistentCount}</div>
                      <div className="text-sm text-red-700">Tutarsız</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-600">{report.notCheckedCount}</div>
                      <div className="text-sm text-gray-700">Kontrol Edilmemiş</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Öneriler */}
              <Alert>
                <AlertTitle>SEO İpucu</AlertTitle>
                <AlertDescription>
                  NAP tutarlılığı, yerel SEO için en önemli faktörlerden biridir. Tüm platformlarda aynı bilgileri
                  kullanarak Google'ın işletmenizi daha iyi anlamasını sağlayın.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="platforms">
            <div className="space-y-6">
              {/* Yeni Platform Ekleme */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-4">Yeni Platform Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Adı</Label>
                    <Input
                      id="platform-name"
                      placeholder="Google Business Profile"
                      value={newPlatform.name}
                      onChange={(e) => setNewPlatform((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform-url">Platform URL</Label>
                    <Input
                      id="platform-url"
                      placeholder="https://business.google.com/..."
                      value={newPlatform.url}
                      onChange={(e) => setNewPlatform((prev) => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddPlatform} disabled={addingPlatform} className="w-full">
                      {addingPlatform ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ekleniyor...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Platform Ekle
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Platform Listesi */}
              <div>
                <h3 className="font-medium mb-4">Takip Edilen Platformlar</h3>

                {platforms.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">Henüz takip edilen platform bulunmuyor.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      İşletmenizin listelendiği platformları ekleyerek NAP tutarlılığını takip edin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {platforms.map((platform) => (
                      <div key={platform.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{platform.name}</h4>
                            <a
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center"
                            >
                              {platform.url}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                          <div>
                            {platform.lastChecked ? (
                              <Badge variant={platform.isConsistent ? "success" : "destructive"}>
                                {platform.isConsistent ? "Tutarlı" : "Tutarsız"}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Kontrol Edilmemiş</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="text-xs text-muted-foreground">
                            {platform.lastChecked
                              ? `Son kontrol: ${new Date(platform.lastChecked).toLocaleDateString()}`
                              : "Henüz kontrol edilmedi"}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateConsistency(platform.id, true)}
                            >
                              <Check className="mr-1 h-4 w-4 text-green-600" />
                              Tutarlı
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateConsistency(platform.id, false)}
                            >
                              <X className="mr-1 h-4 w-4 text-red-600" />
                              Tutarsız
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-4">NAP Verilerini Dışa Aktar</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  İşletme NAP verilerinizi farklı formatlarda dışa aktararak diğer platformlarda kullanabilirsiniz.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">CSV Formatı</CardTitle>
                      <CardDescription>Tablolama programları için</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleCopyNAP("csv")}>
                        <Copy className="mr-2 h-4 w-4" />
                        Kopyala
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadNAP("csv")}>
                        <Download className="mr-2 h-4 w-4" />
                        İndir
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">JSON Formatı</CardTitle>
                      <CardDescription>API ve geliştirme için</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleCopyNAP("json")}>
                        <Copy className="mr-2 h-4 w-4" />
                        Kopyala
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadNAP("json")}>
                        <Download className="mr-2 h-4 w-4" />
                        İndir
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">HTML Formatı</CardTitle>
                      <CardDescription>Web sayfaları için</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleCopyNAP("html")}>
                        <Copy className="mr-2 h-4 w-4" />
                        Kopyala
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadNAP("html")}>
                        <Download className="mr-2 h-4 w-4" />
                        İndir
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              <Alert>
                <AlertTitle>Schema.org Yapılandırılmış Veri</AlertTitle>
                <AlertDescription>
                  HTML formatı, Schema.org yapılandırılmış veri işaretlemesi içerir. Bu, arama motorlarının işletmenizi
                  daha iyi anlamasını sağlar.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">{platforms.length} platform takip ediliyor</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </CardFooter>
    </Card>
  )
}
