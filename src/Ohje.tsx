// Ohje.tsx
import React from 'react';

const Ohje: React.FC = () => {
  return (
    <div className="bg-primary min-h-screen text-black flex flex-col items-center p-4">
      <h1 className="text-secondary text-2xl font-bold mb-2">Suoritelaskurin Käyttöohjeet</h1>
      <h2 className=" text-secondary text-2xl font-semibold mt-4 mb-2">Perustoiminnot</h2>
      <ul className="text-secondary list-disc ml-6 self-start">
        <li>
          <strong>Kalenteri:</strong> Valitse päivämäärä kalenterista, jotta voit tarkastella tai lisätä kyseisen päivän suoritustietoja.
        </li>
        <li>
          <strong>Lisää suorite:</strong> Klikkaa "Lisää suorite" -painiketta ja täytä kohdat. Syötä suorite, työtunnit, sekä tarvittaessa täytä lisäasetukset (esim. ylityö, trukki, tuntikortti).
        </li>
        <li>
          <strong>Muokkaa ja poista:</strong> Jos päivälle on jo lisätty suoritetietoja, voit muokata niitä "Muokkaa" -painikkeella tai poistaa ne "Poista suorite" -painikkeella.
        </li>
      </ul>
      <h2 className="text-secondary text-2xl font-semibold mt-4 mb-2">Tavoitteen Asettaminen</h2>
      <ul className="text-secondary list-disc ml-6 self-start">
        <li>
          Voit säätää tavoitetta liukusäätimellä. Tavoite määrittää, minkä suoritteen sinun tulee saavuttaa.
        </li>
        <li>
          Laskuri laskee automaattisesti päivittäiset suoritevaatimukset, kokonaismäärät ja jäljellä olevat työpäivät.
        </li>
      </ul>
      <h2 className="text-secondary text-2xl font-semibold mt-4 mb-2">Erikoistoiminnot</h2>
      <ul className="text-secondary list-disc ml-6 self-start">
        <li>
          <strong>Trukkikortti:</strong> Jos ajat trukkia, valitse trukkikortti. Kortin voi valita etusivulla pysyvästi tai "Lisää suorite"-ikkunassa erillisenä. Huomioi, että jos trukki-kortti on päällä tasan saman verran kuin keräyskortti, poistuu ruokatunti pelkästään keräyskortista. 
        </li>
        <li>
          <strong>Tuntikortti:</strong> Jos hommia ei ole, voit lisätä tuntikorttiin aikaa ja lopulta vähentää ne työtunneista painamalla "vähennä työtunneista". Huom! Aina kun teet muutoksia, muista painaa "Tallenna" -painiketta.
        </li>
      </ul>

      <div className="text-secondary bg-primary min-h-screen text-black p-6">
      <h1 className="text-secondary text-3xl font-bold mb-6 text-center">Sivuston Tietoja ja Käyttöehdot</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Tietosuojaseloste</h2>
        <p>
          Tämä sivusto kerää vain vähäisiä tietoja käyttäjiltään, kuten evästeiden avulla.
          Emme myy, jaa tai käytä tietojasi markkinointitarkoituksiin ilman suostumustasi. 
          Käytämme tietoja sivuston toimivuuden parantamiseen ja käyttäjäkokemuksen optimoimiseen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Käyttöehdot ja vastuuvapauslauseke</h2>
        <p>
          Käyttämällä tätä sivustoa hyväksyt seuraavat ehdot. Sivuston omistaja ei ole vastuussa 
          mahdollisista virheistä, tiedon puutteellisuudesta tai sivuston käytöstä johtuvista vahingoista.
          Kaikki sisältö on tarkoitettu vain informatiiviseksi, eikä sitä tule käyttää päätöksenteon pohjana.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Yhteystiedot</h2>
        <p>
          Jos sinulla on kysyttävää, palautetta tai muita huolenaiheita, ota yhteyttä: <br />
          <strong>Email:</strong> rami.knaappila@gmail.com <br />
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-2">Lisätietoja
        </h2>
        <p>
          Tämä sivusto noudattaa Googlen AdSense-ohjelman ehtoja ja 
          pyrkii tarjoamaan laadukasta sisältöä ja käyttäjäystävällisen kokemuksen.
        </p>
      </section>
    </div>

    </div>
  );
};

export default Ohje;
