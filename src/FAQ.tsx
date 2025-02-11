// FAQ.tsx
import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    category: "Suoritelaskuri",
    items: [
      {
        question: "Mitä tarkoittaa jakson keskisuorite?",
        answer:
          "Jakson keskisuorite kuvaa kyseisen jakson päivien suoritteiden keskiarvoa prosentteina. Se lasketaan ottamalla kaikkien päivien suoritearvot (prosentteina) ja laskemalla niiden keskiarvo. Tämä kertoo, kuinka hyvin työ on sujunut jakson aikana.",
      },
      {
        question: "Mitä tarkoittaa päivittäinen suorite?",
        answer:
          "Päivittäinen suorite on se vähimmäissuorite, jonka työntekijän tulee saavuttaa jäljellä olevien työpäivien aikana, jotta asetettu tavoite saavutetaan jakson lopussa. Se auttaa suunnittelemaan, kuinka paljon panostusta tarvitaan seuraavina päivinä.",
      },
      {
        question: "Mitä tarkoittaa suoraan tavoitteeseen?",
        answer:
          "Suoraan tavoitteeseen tarkoittaa sitä, että työntekijä voi pyrkiä saavuttamaan seuraavana päivänä heti asetetun jakson tavoitteen. Esimerkiksi, jos tavoitteena on 110 %, niin seuraavana päivänä tarvittava suorite nostaa koko jakson keskiarvon suoraan siihen tasoon.",
      },
      {
        question: "Mitä tarkoittaa työpäiviä jäljellä?",
        answer:
          "Työpäiviä jäljellä kertoo, kuinka monta työpäivää on vielä jäljellä kyseisessä jaksossa. Tämä luku auttaa arvioimaan, kuinka paljon suoritetta tarvitaan kunkin jäljellä olevan päivän aikana, jotta käyttäjän asetettu tavoite saavutetaan.",
      },
      {
        question: "Mitä tapahtuu, jos olen tehnyt muita työtehtäviä muulla kuin keräyskortilla?",
        answer:
          "Oletuksena työntekijän kantaurakka on äänikeräys joka suoritetaan koodilla 0591. Jos työpäivän aikana vaihdat koodia esimerkiksi 0721:een, kyseinen tehtävä kirjataan erikseen eikä vaikuta 0591-koodin keskiarvoon. Toisin sanoen, 0591-koodilla suoritettu työ ja siihen liittyvä suorite lasketaan omaksi kokonaisuudekseen. Esimerkiksi, jos 4 tunnin aikana 0591-koodilla saavutetaan 6 suoritetta (mikä vastaa 184 % suoritetta), tämä luku muodostaa 0591:n keskiarvon. Muilla työkoodeilla tehdyt tehtävät eivät siis vaikuta 0591:n keskiarvoon, vaan ne kirjataan erikseen.",
      },
      {
        question: "Voiko trukkikuski hyödyntää suoritelaskuria?",
        answer:
          "Kyllä, trukkikuski voi hyödyntää suoritelaskuria. Suoritelaskuri toimii suoriteasteella, joka ilmoitetaan prosentteina. Tämä lasketaan vertaamalla työnteon aikana saavutettua suoritetta siihen, kuinka monta tuntia työntekijä todellisuudessa käyttää työtehtävissään. Näin saadaan mitattua, kuinka tehokkaasti työ on sujunut suhteessa asetettuun tavoitteeseen.",
      },
    ],
  },
  {
    category: "Työpaikan toimintatavat",
    items: [
      {
        question: "Lisätietoa Keskon toimintatavoista?",
        answer: (
          <>
            Lisätietoja Keskon toimintatavoista saat kirjautumalla My K:hon:{" "}
            <a
              href="https://keskogroup.sharepoint.com/sites/myk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              https://keskogroup.sharepoint.com/sites/myk
            </a>
          </>
        ),
      },
    ],
  },
  {
    category: "Tarrakeräys",
    items: [
      {
        question: "Mitä huomioida tarrakeräyksessä?",
        answer:
          "Tarrakeräyksessä työnjakaja jakaa työntekijälle erilaisia tehtäviä, jotka suoritetaan pääosin tulostetuilla tarroilla. Tarrakeräyksen yhteydessä työntekijä käyttää FioriWM-päätettä ALHA:n tekemiseen. ",
      },

      {
        question: "Mikä on ALHA ja miten se tehdään?",
        answer: (
          <>
            <p><strong>Miten ALHA tehdään?</strong></p>
            <ol>
              <li>Toimistosta otetaan Alustanhallinta-QR-koodilla varustettu tarra.</li>
              <li>FioriWM-päätteellä kirjautumisen jälkeen valitaan "Uusi Alusta" ja QR-koodi skannataan.</li>
              <li>Skannauksen jälkeen työntekijä syöttää tarvittavat tiedot, kuten asiakkaan numeron (esim. 225-073), terminaalin numeron (esim. 9061) ja lastauspäivämäärän.</li>
            </ol>
            <p>ALHA tehdään aina yhtä per rullakkoa kohti – riippumatta siitä, onko rullakossa välitasoja. Yleisenä nyrkkisääntönä ALHA tehdään alimmalle asiakkaalle.</p>
            <p>ALHA:n avulla selvitetään, kuinka monta rullakkoa on menossa kuljetukseen.</p>
            <p><strong>Nyrkkisäännöt:</strong></p>
            <ul>
              <li>Koodia 9031 ei käytetä terminaalin kohdalla, sillä se on Keskon pakastevaraston oma terminaalitunnus.</li>
              <li>Ainoa poikkeus, jossa ALHA:a ei tehdä on noutoasiakkailla 9132 9032 </li>
            </ul>
          </>
        )
      }
    ],
  },
];

const FAQ: React.FC = () => {
  const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(null);
  const [openQuestionIndex, setOpenQuestionIndex] = useState<{ [key: number]: number | null }>({});

  const toggleCategory = (index: number) => {
    setOpenCategoryIndex(openCategoryIndex === index ? null : index);
    // Reset open questions when a new category is toggled.
    setOpenQuestionIndex({});
  };

  const toggleQuestion = (catIndex: number, quesIndex: number) => {
    setOpenQuestionIndex((prev) => ({
      ...prev,
      [catIndex]: prev[catIndex] === quesIndex ? null : quesIndex,
    }));
  };

  return (
    <div className="bg-primary min-h-screen text-black flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-[#FF9C01] mb-6 text-center">
        Usein Kysytyt Kysymykset (FAQ)
      </h1>
      <div className="w-full max-w-3xl space-y-6">
        {faqCategories.map((cat, catIndex) => (
          <div key={catIndex} className="border rounded shadow">
            <button
              className="w-full text-left px-4 py-3 bg-gray-800 text-[#FF9C01] hover:bg-gray-700 focus:outline-none focus:ring"
              onClick={() => toggleCategory(catIndex)}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{cat.category}</span>
                <span className="text-xl">{openCategoryIndex === catIndex ? "−" : "+"}</span>
              </div>
            </button>
            {openCategoryIndex === catIndex && (
              <div className="space-y-2">
                {cat.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border-t">
                    <button
                      className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring"
                      onClick={() => toggleQuestion(catIndex, itemIndex)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.question}</span>
                        <span className="text-xl">
                          {openQuestionIndex[catIndex] === itemIndex ? "−" : "+"}
                        </span>
                      </div>
                    </button>
                    {openQuestionIndex[catIndex] === itemIndex && (
                      <div className="px-4 py-2 bg-white">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
export { faqCategories };
