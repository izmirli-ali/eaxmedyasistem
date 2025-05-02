"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Şehir ve ilçe verileri
const TURKIYE_ILLERI = {
  Adana: [
    "Aladağ",
    "Ceyhan",
    "Çukurova",
    "Feke",
    "İmamoğlu",
    "Karaisalı",
    "Karataş",
    "Kozan",
    "Pozantı",
    "Saimbeyli",
    "Sarıçam",
    "Seyhan",
    "Tufanbeyli",
    "Yumurtalık",
    "Yüreğir",
  ],
  Adıyaman: ["Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Merkez", "Samsat", "Sincik", "Tut"],
  Afyonkarahisar: [
    "Başmakçı",
    "Bayat",
    "Bolvadin",
    "Çay",
    "Çobanlar",
    "Dazkırı",
    "Dinar",
    "Emirdağ",
    "Evciler",
    "Hocalar",
    "İhsaniye",
    "İscehisar",
    "Kızılören",
    "Merkez",
    "Sandıklı",
    "Sinanpaşa",
    "Sultandağı",
    "Şuhut",
  ],
  Ağrı: ["Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Merkez", "Patnos", "Taşlıçay", "Tutak"],
  Amasya: ["Göynücek", "Gümüşhacıköy", "Hamamözü", "Merkez", "Merzifon", "Suluova", "Taşova"],
  Ankara: [
    "Akyurt",
    "Altındağ",
    "Ayaş",
    "Bala",
    "Beypazarı",
    "Çamlıdere",
    "Çankaya",
    "Çubuk",
    "Elmadağ",
    "Etimesgut",
    "Evren",
    "Gölbaşı",
    "Güdül",
    "Haymana",
    "Kahramankazan",
    "Kalecik",
    "Keçiören",
    "Kızılcahamam",
    "Mamak",
    "Nallıhan",
    "Polatlı",
    "Pursaklar",
    "Sincan",
    "Şereflikoçhisar",
    "Yenimahalle",
  ],
  Antalya: [
    "Akseki",
    "Aksu",
    "Alanya",
    "Demre",
    "Döşemealtı",
    "Elmalı",
    "Finike",
    "Gazipaşa",
    "Gündoğmuş",
    "İbradı",
    "Kaş",
    "Kemer",
    "Kepez",
    "Konyaaltı",
    "Korkuteli",
    "Kumluca",
    "Manavgat",
    "Muratpaşa",
    "Serik",
  ],
  Artvin: ["Ardanuç", "Arhavi", "Borçka", "Hopa", "Kemalpaşa", "Merkez", "Murgul", "Şavşat", "Yusufeli"],
  Aydın: [
    "Bozdoğan",
    "Buharkent",
    "Çine",
    "Didim",
    "Efeler",
    "Germencik",
    "İncirliova",
    "Karacasu",
    "Karpuzlu",
    "Koçarlı",
    "Köşk",
    "Kuşadası",
    "Kuyucak",
    "Nazilli",
    "Söke",
    "Sultanhisar",
    "Yenipazar",
  ],
  Balıkesir: [
    "Altıeylül",
    "Ayvalık",
    "Balya",
    "Bandırma",
    "Bigadiç",
    "Burhaniye",
    "Dursunbey",
    "Edremit",
    "Erdek",
    "Gömeç",
    "Gönen",
    "Havran",
    "İvrindi",
    "Karesi",
    "Kepsut",
    "Manyas",
    "Marmara",
    "Savaştepe",
    "Sındırgı",
    "Susurluk",
  ],
  Bartın: ["Amasra", "Kurucaşile", "Merkez", "Ulus"],
  Batman: ["Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Merkez", "Sason"],
  Bayburt: ["Aydıntepe", "Demirözü", "Merkez"],
  Bilecik: ["Bozüyük", "Gölpazarı", "İnhisar", "Merkez", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"],
  Bingöl: ["Adaklı", "Genç", "Karlıova", "Kiğı", "Merkez", "Solhan", "Yayladere", "Yedisu"],
  Bitlis: ["Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Merkez", "Mutki", "Tatvan"],
  Bolu: ["Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Merkez", "Mudurnu", "Seben", "Yeniçağa"],
  Burdur: [
    "Ağlasun",
    "Altınyayla",
    "Bucak",
    "Çavdır",
    "Çeltikçi",
    "Gölhisar",
    "Karamanlı",
    "Kemer",
    "Merkez",
    "Tefenni",
    "Yeşilova",
  ],
  Bursa: [
    "Büyükorhan",
    "Gemlik",
    "Gürsu",
    "Harmancık",
    "İnegöl",
    "İznik",
    "Karacabey",
    "Keles",
    "Kestel",
    "Mudanya",
    "Mustafakemalpaşa",
    "Nilüfer",
    "Orhaneli",
    "Orhangazi",
    "Osmangazi",
    "Yenişehir",
    "Yıldırım",
  ],
  Çanakkale: [
    "Ayvacık",
    "Bayramiç",
    "Biga",
    "Bozcaada",
    "Çan",
    "Eceabat",
    "Ezine",
    "Gelibolu",
    "Gökçeada",
    "Lapseki",
    "Merkez",
    "Yenice",
  ],
  Çankırı: [
    "Atkaracalar",
    "Bayramören",
    "Çerkeş",
    "Eldivan",
    "Ilgaz",
    "Kızılırmak",
    "Korgun",
    "Kurşunlu",
    "Merkez",
    "Orta",
    "Şabanözü",
    "Yapraklı",
  ],
  Çorum: [
    "Alaca",
    "Bayat",
    "Boğazkale",
    "Dodurga",
    "İskilip",
    "Kargı",
    "Laçin",
    "Mecitözü",
    "Merkez",
    "Oğuzlar",
    "Ortaköy",
    "Osmancık",
    "Sungurlu",
    "Uğurludağ",
  ],
  Denizli: [
    "Acıpayam",
    "Babadağ",
    "Baklan",
    "Bekilli",
    "Beyağaç",
    "Bozkurt",
    "Buldan",
    "Çal",
    "Çameli",
    "Çardak",
    "Çivril",
    "Güney",
    "Honaz",
    "Kale",
    "Merkezefendi",
    "Pamukkale",
    "Sarayköy",
    "Serinhisar",
    "Tavas",
  ],
  Diyarbakır: [
    "Bağlar",
    "Bismil",
    "Çermik",
    "Çınar",
    "Çüngüş",
    "Dicle",
    "Eğil",
    "Ergani",
    "Hani",
    "Hazro",
    "Kayapınar",
    "Kocaköy",
    "Kulp",
    "Lice",
    "Silvan",
    "Sur",
    "Yenişehir",
  ],
  Düzce: ["Akçakoca", "Çilimli", "Cumayeri", "Gölyaka", "Gümüşova", "Kaynaşlı", "Merkez", "Yığılca"],
  Edirne: ["Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Merkez", "Süloğlu", "Uzunköprü"],
  Elazığ: [
    "Ağın",
    "Alacakaya",
    "Arıcak",
    "Baskil",
    "Karakoçan",
    "Keban",
    "Kovancılar",
    "Maden",
    "Merkez",
    "Palu",
    "Sivrice",
  ],
  Erzincan: ["Çayırlı", "İliç", "Kemah", "Kemaliye", "Merkez", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"],
  Erzurum: [
    "Aşkale",
    "Aziziye",
    "Çat",
    "Hınıs",
    "Horasan",
    "İspir",
    "Karaçoban",
    "Karayazı",
    "Köprüköy",
    "Narman",
    "Oltu",
    "Olur",
    "Palandöken",
    "Pasinler",
    "Pazaryolu",
    "Şenkaya",
    "Tekman",
    "Tortum",
    "Uzundere",
    "Yakutiye",
  ],
  Eskişehir: [
    "Alpu",
    "Beylikova",
    "Çifteler",
    "Günyüzü",
    "Han",
    "İnönü",
    "Mahmudiye",
    "Mihalgazi",
    "Mihalıççık",
    "Odunpazarı",
    "Sarıcakaya",
    "Seyitgazi",
    "Sivrihisar",
    "Tepebaşı",
  ],
  Gaziantep: ["Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli"],
  Giresun: [
    "Alucra",
    "Bulancak",
    "Çamoluk",
    "Çanakçı",
    "Dereli",
    "Doğankent",
    "Espiye",
    "Eynesil",
    "Görele",
    "Güce",
    "Keşap",
    "Merkez",
    "Piraziz",
    "Şebinkarahisar",
    "Tirebolu",
    "Yağlıdere",
  ],
  Gümüşhane: ["Kelkit", "Köse", "Kürtün", "Merkez", "Şiran", "Torul"],
  Hakkari: ["Çukurca", "Derecik", "Merkez", "Şemdinli", "Yüksekova"],
  Hatay: [
    "Altınözü",
    "Antakya",
    "Arsuz",
    "Belen",
    "Defne",
    "Dörtyol",
    "Erzin",
    "Hassa",
    "İskenderun",
    "Kırıkhan",
    "Kumlu",
    "Payas",
    "Reyhanlı",
    "Samandağ",
    "Yayladağı",
  ],
  Iğdır: ["Aralık", "Karakoyunlu", "Merkez", "Tuzluca"],
  Isparta: [
    "Aksu",
    "Atabey",
    "Eğirdir",
    "Gelendost",
    "Gönen",
    "Keçiborlu",
    "Merkez",
    "Senirkent",
    "Sütçüler",
    "Şarkikaraağaç",
    "Uluborlu",
    "Yalvaç",
    "Yenişarbademli",
  ],
  İstanbul: [
    "Adalar",
    "Arnavutköy",
    "Ataşehir",
    "Avcılar",
    "Bağcılar",
    "Bahçelievler",
    "Bakırköy",
    "Başakşehir",
    "Bayrampaşa",
    "Beşiktaş",
    "Beykoz",
    "Beylikdüzü",
    "Beyoğlu",
    "Büyükçekmece",
    "Çatalca",
    "Çekmeköy",
    "Esenler",
    "Esenyurt",
    "Eyüpsultan",
    "Fatih",
    "Gaziosmanpaşa",
    "Güngören",
    "Kadıköy",
    "Kağıthane",
    "Kartal",
    "Küçükçekmece",
    "Maltepe",
    "Pendik",
    "Sancaktepe",
    "Sarıyer",
    "Silivri",
    "Sultanbeyli",
    "Sultangazi",
    "Şile",
    "Şişli",
    "Tuzla",
    "Ümraniye",
    "Üsküdar",
    "Zeytinburnu",
  ],
  İzmir: [
    "Aliağa",
    "Balçova",
    "Bayındır",
    "Bayraklı",
    "Bergama",
    "Beydağ",
    "Bornova",
    "Buca",
    "Çeşme",
    "Çiğli",
    "Dikili",
    "Foça",
    "Gaziemir",
    "Güzelbahçe",
    "Karabağlar",
    "Karaburun",
    "Karşıyaka",
    "Kemalpaşa",
    "Kınık",
    "Kiraz",
    "Konak",
    "Menderes",
    "Menemen",
    "Narlıdere",
    "Ödemiş",
    "Seferihisar",
    "Selçuk",
    "Tire",
    "Torbalı",
    "Urla",
  ],
  Kahramanmaraş: [
    "Afşin",
    "Andırın",
    "Çağlayancerit",
    "Dulkadiroğlu",
    "Ekinözü",
    "Elbistan",
    "Göksun",
    "Nurhak",
    "Onikişubat",
    "Pazarcık",
    "Türkoğlu",
  ],
  Karabük: ["Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"],
  Karaman: ["Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Merkez", "Sarıveliler"],
  Kars: ["Akyaka", "Arpaçay", "Digor", "Kağızman", "Merkez", "Sarıkamış", "Selim", "Susuz"],
  Kastamonu: [
    "Abana",
    "Ağlı",
    "Araç",
    "Azdavay",
    "Bozkurt",
    "Cide",
    "Çatalzeytin",
    "Daday",
    "Devrekani",
    "Doğanyurt",
    "Hanönü",
    "İhsangazi",
    "İnebolu",
    "Küre",
    "Merkez",
    "Pınarbaşı",
    "Seydiler",
    "Şenpazar",
    "Taşköprü",
    "Tosya",
  ],
  Kayseri: [
    "Akkışla",
    "Bünyan",
    "Develi",
    "Felahiye",
    "Hacılar",
    "İncesu",
    "Kocasinan",
    "Melikgazi",
    "Özvatan",
    "Pınarbaşı",
    "Sarıoğlan",
    "Sarız",
    "Talas",
    "Tomarza",
    "Yahyalı",
    "Yeşilhisar",
  ],
  Kırıkkale: ["Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Merkez", "Sulakyurt", "Yahşihan"],
  Kırklareli: ["Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Merkez", "Pehlivanköy", "Pınarhisar", "Vize"],
  Kırşehir: ["Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Merkez", "Mucur"],
  Kilis: ["Elbeyli", "Merkez", "Musabeyli", "Polateli"],
  Kocaeli: [
    "Başiskele",
    "Çayırova",
    "Darıca",
    "Derince",
    "Dilovası",
    "Gebze",
    "Gölcük",
    "İzmit",
    "Kandıra",
    "Karamürsel",
    "Kartepe",
    "Körfez",
  ],
  Konya: [
    "Ahırlı",
    "Akören",
    "Akşehir",
    "Altınekin",
    "Beyşehir",
    "Bozkır",
    "Cihanbeyli",
    "Çeltik",
    "Çumra",
    "Derbent",
    "Derebucak",
    "Doğanhisar",
    "Emirgazi",
    "Ereğli",
    "Güneysınır",
    "Hadim",
    "Halkapınar",
    "Hüyük",
    "Ilgın",
    "Kadınhanı",
    "Karapınar",
    "Karatay",
    "Kulu",
    "Meram",
    "Sarayönü",
    "Selçuklu",
    "Seydişehir",
    "Taşkent",
    "Tuzlukçu",
    "Yalıhüyük",
    "Yunak",
  ],
  Kütahya: [
    "Altıntaş",
    "Aslanapa",
    "Çavdarhisar",
    "Domaniç",
    "Dumlupınar",
    "Emet",
    "Gediz",
    "Hisarcık",
    "Merkez",
    "Pazarlar",
    "Şaphane",
    "Simav",
    "Tavşanlı",
  ],
  Malatya: [
    "Akçadağ",
    "Arapgir",
    "Arguvan",
    "Battalgazi",
    "Darende",
    "Doğanşehir",
    "Doğanyol",
    "Hekimhan",
    "Kale",
    "Kuluncak",
    "Pütürge",
    "Yazıhan",
    "Yeşilyurt",
  ],
  Manisa: [
    "Ahmetli",
    "Akhisar",
    "Alaşehir",
    "Demirci",
    "Gölmarmara",
    "Gördes",
    "Kırkağaç",
    "Köprübaşı",
    "Kula",
    "Salihli",
    "Sarıgöl",
    "Saruhanlı",
    "Selendi",
    "Soma",
    "Şehzadeler",
    "Turgutlu",
    "Yunusemre",
  ],
  Mardin: ["Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"],
  Mersin: [
    "Akdeniz",
    "Anamur",
    "Aydıncık",
    "Bozyazı",
    "Çamlıyayla",
    "Erdemli",
    "Gülnar",
    "Mezitli",
    "Mut",
    "Silifke",
    "Tarsus",
    "Toroslar",
    "Yenişehir",
  ],
  Muğla: [
    "Bodrum",
    "Dalaman",
    "Datça",
    "Fethiye",
    "Kavaklıdere",
    "Köyceğiz",
    "Marmaris",
    "Menteşe",
    "Milas",
    "Ortaca",
    "Seydikemer",
    "Ula",
    "Yatağan",
  ],
  Muş: ["Bulanık", "Hasköy", "Korkut", "Malazgirt", "Merkez", "Varto"],
  Nevşehir: ["Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Merkez", "Ürgüp"],
  Niğde: ["Altunhisar", "Bor", "Çamardı", "Çiftlik", "Merkez", "Ulukışla"],
  Ordu: [
    "Akkuş",
    "Altınordu",
    "Aybastı",
    "Çamaş",
    "Çatalpınar",
    "Çaybaşı",
    "Fatsa",
    "Gölköy",
    "Gülyalı",
    "Gürgentepe",
    "İkizce",
    "Kabadüz",
    "Kabataş",
    "Korgan",
    "Kumru",
    "Mesudiye",
    "Perşembe",
    "Ulubey",
    "Ünye",
  ],
  Osmaniye: ["Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Merkez", "Sumbas", "Toprakkale"],
  Rize: [
    "Ardeşen",
    "Çamlıhemşin",
    "Çayeli",
    "Derepazarı",
    "Fındıklı",
    "Güneysu",
    "Hemşin",
    "İkizdere",
    "İyidere",
    "Kalkandere",
    "Merkez",
    "Pazar",
  ],
  Sakarya: [
    "Adapazarı",
    "Akyazı",
    "Arifiye",
    "Erenler",
    "Ferizli",
    "Geyve",
    "Hendek",
    "Karapürçek",
    "Karasu",
    "Kaynarca",
    "Kocaali",
    "Pamukova",
    "Sapanca",
    "Serdivan",
    "Söğütlü",
    "Taraklı",
  ],
  Samsun: [
    "Alaçam",
    "Asarcık",
    "Atakum",
    "Ayvacık",
    "Bafra",
    "Canik",
    "Çarşamba",
    "Havza",
    "İlkadım",
    "Kavak",
    "Ladik",
    "Ondokuzmayıs",
    "Salıpazarı",
    "Tekkeköy",
    "Terme",
    "Vezirköprü",
    "Yakakent",
  ],
  Siirt: ["Baykan", "Eruh", "Kurtalan", "Merkez", "Pervari", "Şirvan", "Tillo"],
  Sinop: ["Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Merkez", "Saraydüzü", "Türkeli"],
  Sivas: [
    "Akıncılar",
    "Altınyayla",
    "Divriği",
    "Doğanşar",
    "Gemerek",
    "Gölova",
    "Hafik",
    "İmranlı",
    "Kangal",
    "Koyulhisar",
    "Merkez",
    "Şarkışla",
    "Suşehri",
    "Ulaş",
    "Yıldızeli",
    "Zara",
  ],
  Şanlıurfa: [
    "Akçakale",
    "Birecik",
    "Bozova",
    "Ceylanpınar",
    "Eyyübiye",
    "Halfeti",
    "Haliliye",
    "Harran",
    "Hilvan",
    "Karaköprü",
    "Siverek",
    "Suruç",
    "Viranşehir",
  ],
  Şırnak: ["Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Merkez", "Silopi", "Uludere"],
  Tekirdağ: [
    "Çerkezköy",
    "Çorlu",
    "Ergene",
    "Hayrabolu",
    "Kapaklı",
    "Malkara",
    "Marmaraereğlisi",
    "Muratlı",
    "Saray",
    "Süleymanpaşa",
    "Şarköy",
  ],
  Tokat: [
    "Almus",
    "Artova",
    "Başçiftlik",
    "Erbaa",
    "Merkez",
    "Niksar",
    "Pazar",
    "Reşadiye",
    "Sulusaray",
    "Turhal",
    "Yeşilyurt",
    "Zile",
  ],
  Trabzon: [
    "Akçaabat",
    "Araklı",
    "Arsin",
    "Beşikdüzü",
    "Çarşıbaşı",
    "Çaykara",
    "Dernekpazarı",
    "Düzköy",
    "Hayrat",
    "Köprübaşı",
    "Maçka",
    "Of",
    "Ortahisar",
    "Sürmene",
    "Şalpazarı",
    "Tonya",
    "Vakfıkebir",
    "Yomra",
  ],
  Tunceli: ["Çemişgezek", "Hozat", "Mazgirt", "Merkez", "Nazımiye", "Ovacık", "Pertek", "Pülümür"],
  Uşak: ["Banaz", "Eşme", "Karahallı", "Merkez", "Sivaslı", "Ulubey"],
  Van: [
    "Bahçesaray",
    "Başkale",
    "Çaldıran",
    "Çatak",
    "Edremit",
    "Erciş",
    "Gevaş",
    "Gürpınar",
    "İpekyolu",
    "Muradiye",
    "Özalp",
    "Saray",
    "Tuşba",
  ],
  Yalova: ["Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Merkez", "Termal"],
  Yozgat: [
    "Akdağmadeni",
    "Aydıncık",
    "Boğazlıyan",
    "Çandır",
    "Çayıralan",
    "Çekerek",
    "Kadışehri",
    "Merkez",
    "Saraykent",
    "Sarıkaya",
    "Şefaatli",
    "Sorgun",
    "Yenifakılı",
    "Yerköy",
  ],
  Zonguldak: ["Alaplı", "Çaycuma", "Devrek", "Ereğli", "Gökçebey", "Kilimli", "Kozlu", "Merkez"],
}

interface KonumBilgileriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function KonumBilgileriForm({ formData, onChange, errors }: KonumBilgileriFormProps) {
  const [loading, setLoading] = useState(false)
  const [ilceler, setIlceler] = useState<string[]>([])

  // Şehir değiştiğinde ilçeleri güncelle
  useEffect(() => {
    if (formData.sehir) {
      const ilceListesi = TURKIYE_ILLERI[formData.sehir as keyof typeof TURKIYE_ILLERI] || []
      setIlceler(ilceListesi)

      // Eğer seçili ilçe, yeni şehrin ilçelerinde yoksa sıfırla
      if (formData.ilce && !ilceListesi.includes(formData.ilce)) {
        onChange("ilce", "")
      }
    } else {
      setIlceler([])
    }
  }, [formData.sehir, onChange])

  // Konum alma fonksiyonu
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum özelliğini desteklemiyor.")
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange("latitude", position.coords.latitude.toString())
        onChange("longitude", position.coords.longitude.toString())
        onChange("koordinatlar", `${position.coords.latitude},${position.coords.longitude}`)
        setLoading(false)
      },
      (error) => {
        console.error("Konum alınamadı:", error)
        alert("Konum alınamadı. Lütfen manuel olarak girin.")
        setLoading(false)
      },
    )
  }

  // Adres otomatik tamamlama işleyicisi
  const handleAddressChange = (address: string, placeData?: any) => {
    onChange("adres", address)

    if (placeData && placeData.geometry && placeData.geometry.location) {
      const lat = placeData.geometry.location.lat()
      const lng = placeData.geometry.location.lng()

      onChange("latitude", lat.toString())
      onChange("longitude", lng.toString())
      onChange("koordinatlar", `${lat},${lng}`)

      // Şehir ve ilçe bilgilerini çıkar
      if (placeData.address_components) {
        const addressComponents = placeData.address_components

        // Şehir bilgisi
        const cityComponent = addressComponents.find((component: any) =>
          component.types.includes("administrative_area_level_1"),
        )

        // İlçe bilgisi
        const districtComponent = addressComponents.find((component: any) =>
          component.types.includes("administrative_area_level_2"),
        )

        if (cityComponent) {
          const cityName = cityComponent.long_name
          // Türkçe karakter düzeltmeleri
          const normalizedCityName = cityName
            .replace("İ", "I")
            .replace("ı", "i")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")

          // Şehir adını kontrol et ve eşleşen bir şehir varsa seç
          const matchedCity = Object.keys(TURKIYE_ILLERI).find(
            (city) =>
              city
                .toUpperCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") === normalizedCityName.toUpperCase(),
          )

          if (matchedCity) {
            onChange("sehir", matchedCity)
          }
        }

        if (districtComponent) {
          const districtName = districtComponent.long_name
          onChange("ilce", districtName)
        }
      }
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-primary">
          <MapPin className="h-5 w-5" />
          <h3>Konum Bilgileri</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adres" className={errors.adres ? "text-destructive" : ""}>
              Adres *
            </Label>
            <AddressAutocomplete
              value={formData.adres || ""}
              onChange={handleAddressChange}
              placeholder="İşletme adresini girin"
              error={errors.adres}
            />
            {errors.adres && <p className="text-xs text-destructive mt-1">{errors.adres}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Enlem (Latitude)</Label>
              <Input
                id="latitude"
                type="text"
                value={formData.latitude || ""}
                onChange={(e) => {
                  onChange("latitude", e.target.value)
                  if (formData.longitude) {
                    onChange("koordinatlar", `${e.target.value},${formData.longitude}`)
                  }
                }}
                placeholder="Örn: 41.0082"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Boylam (Longitude)</Label>
              <Input
                id="longitude"
                type="text"
                value={formData.longitude || ""}
                onChange={(e) => {
                  onChange("longitude", e.target.value)
                  if (formData.latitude) {
                    onChange("koordinatlar", `${formData.latitude},${e.target.value}`)
                  }
                }}
                placeholder="Örn: 28.9784"
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Konum Alınıyor...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Mevcut Konumu Al
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harita_linki">Google Harita Linki (iFrame)</Label>
            <Textarea
              id="harita_linki"
              value={formData.harita_linki || ""}
              onChange={(e) => onChange("harita_linki", e.target.value)}
              placeholder="<iframe src='https://www.google.com/maps/embed?...'></iframe>"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Google Haritalar'da konumu bulun, "Paylaş" &gt; "Haritayı yerleştir" seçeneğinden HTML kodunu kopyalayıp
              buraya yapıştırın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="sehir" className={errors.sehir ? "text-destructive" : ""}>
                Şehir *
              </Label>
              <Select value={formData.sehir || ""} onValueChange={(value) => onChange("sehir", value)}>
                <SelectTrigger id="sehir" className={errors.sehir ? "border-destructive" : ""}>
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TURKIYE_ILLERI).map((sehir) => (
                    <SelectItem key={sehir} value={sehir}>
                      {sehir}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sehir && <p className="text-xs text-destructive mt-1">{errors.sehir}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ilce">
                İlçe <span className="text-muted-foreground text-xs">(opsiyonel)</span>
              </Label>
              <Select
                value={formData.ilce || ""}
                onValueChange={(value) => onChange("ilce", value)}
                disabled={!formData.sehir || ilceler.length === 0}
              >
                <SelectTrigger id="ilce">
                  <SelectValue placeholder="İlçe seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ilceler.map((ilce) => (
                    <SelectItem key={ilce} value={ilce}>
                      {ilce}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
