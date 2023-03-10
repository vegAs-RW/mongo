// Combien de restaurant italien
db.restaurants.find({ cuisine : 'Italian' } ).count()

// Combien de restaurants italien dans le quartier de Brooklyn
db.restaurants.find( { $and : [ { cuisine : 'Italian' }, { borough : 'Brooklyn' } ] } ).count()

// 01. Combien y a t il de restaurants qui font de la cuisine italienne et qui ont eu un score de 10 au moins ?
// Affichez également le nom, les scores et les coordonnées GPS de ces restaurants. Ordonnez les résultats par ordre décroissant sur les noms des restaurants.
db.restaurants.find( 
    {
      $and: [ 
        { cuisine: 'Italian' }, 
        { 'grades.score': { $gte : 10 } } 
      ] 
    },
    {
      _id: 0,
      name: 1, 
      'grades.address.coord': 1,
      'grades.score': 1,
  
    } ).sort({
      name: -1
    }).pretty()

// 02 03. Quels sont les restaurants qui ont eu un grade A et un score supérieur ou égal à 20 ? Affichez uniquement les noms et ordonnez les par ordre décroissant. Affichez le nombre de résultat.
db.restaurants.find( { 
    $and : [
      { "grades.grade": "A" }, 
      { "grades.score": { $gte: 20 } },
    ]
  }
      ,
      {
        _id: 0,
        "grades.grade": 1,
        "grades.score": 1,
      }
    ).sort({ name: -1 });

// Que des scores supérieurs à 20 uniquement
db.restaurants.find( {
    $and : [
      { "grades.score": { $not : {$lt: 20 }} },
      { "grades.score" : { $exists : true }}
    ]
    }
        
        ,
        {
          _id: 0,
          "grades.grade": 1,
          "grades.score": 1,
        }
      ).sort({ name: -1 });

// 04. A l'aide de la méthode distinct trouvez tous les quartiers distincts de NY.
db.restaurants.distinct("borough");

// 05. Trouvez tous les types de restaurants dans le quartiers du Bronx. Vous pouvez là encore utiliser distinct et un deuxième paramètre pour préciser sur quel ensemble vous voulez appliquer cette close:
db.restaurants.distinct("cuisine", { borough: "Bronx" });

// 06 Trouvez tous les restaurants dans le quartier du Bronx qui ont eu 4 grades.
db.restaurants.find(
    { borough: "Bronx", grades: { $size: 4 } },
    { _id: 0, name: 1, "address.coord": 1, grades : 1 }
  ).pretty();

// 07. Sélectionnez les restaurants dont le grade est A ou B dans le Bronx.
db.restaurants.find({
    $and : [
      {borough: "Bronx"},
     { "grades.grade": { $in: ["A", "B"] }}
    ] }).count();

// 08. Même question mais, on aimerait récupérer les restaurants qui ont eu à la dernière inspection (elle apparaît théoriquement en premier dans la liste des grades) un A ou B. Vous pouvez utilisez la notion d'indice sur la clé grade :
db.restaurants.find(
    {
      $and: [
        {
          $or: [{ "grades.0.grade": "A" }, { "grades.0.grade": "B" }],
        },
        {
          borough: "Bronx",
        },
      ],
    },
    { _id: 0, name: 1, grades: {$first : "$grades" } }
  ).pretty();

// 09. Sélectionnez maintenant tous les restaurants qui ont le mot "Coffee" ou "coffee" dans la propriété name du document. Puis, même question mais uniquement dans le quartier du Bronx.
db.restaurants.find({
    name: /coffee/
  }, {
    _id: 0,
    name: 1
  })
  
  db.restaurants.find({
    name: /Coffee/
  }, {
    _id: 0,
    name: 1
  })
  
  // En utilisant l'option i insensible à la casse 
  db.restaurants.find({
    name: /coffee/i
  }, {
    _id: 0,
    name: 1
  })
// Comptez également leurs nombres total et calculez la différence numérique entre les restaurants Coffee et coffee. Utilisez une Regex :
const countcoffee = () => db.restaurants.find({
    name: /coffee/
  }).count()
  
  const countCoffee = () => db.restaurants.find({
    name: /Coffee/
  }).count()
  
  
  print(`La différence nb de restaurant(s) coffee/Coffee en valeur absolue: ${Math.abs( countcoffee - countCoffee )}`)

// update 
db.restaurants.updateOne({name: /Coffee/}, {
    $set:{ name: 'coffee' }
  })
  
  // on peut tous les remettre en majuscule 
  db.restaurants.updateMany({name: /coffee/}, {
    $set:{ name: 'Coffee' }
  })

// 10. Trouvez tous les restaurants avec les mots Coffee ou |  et qui ne contiennent pas le mot Starbucks. Puis, même question mais uniquement dans le quartier du Bronx.
db.restaurants.find({
    $and: [
        {name: /Coffee | Restaurant/i},
        {name: /^(?!Starbucks)/}
    ]
    },
        {_id:0, name:1}  
)

db.restaurants.find({
    $and: [
      {name: /Coffee|Restaurant/i}, 
      {name: {$nin: [ /Starbucks/i] }}
    ]
  },
   { _id: 0, name: 1}
  )

// 11.Trouvez tous les restaurants qui ont dans leur nom le mot clé coffee, qui sont dans le bronx ou dans Brooklyn, qui ont eu exactement 4 appréciations (grades). 
db.restaurants.find({
    $and: [
        {name: /coffee/i},
        {$or: [{borough: 'Bronx'}, {borough: 'Brooklyn'}]},
        {grades: {$size: 4}}

    ]
},
{_id:0, name: 1})

// 12. Reprenez la question 11 et affichez tous les noms de ces restaurants en majuscule avec leur dernière date et permière date d'évaluation.
db.restaurants.find({
    $and: [
        {name: /coffee/i},
        {$or: [{borough: 'Bronx'}, {borough: 'Brooklyn'}]},
        {grades: {$size: 4}}

    ]
},
{_id:0, name: 1, grades:1}).forEach(data => {
    print(data.name.toUpperCase())
    let firstEval = data.grades[0].date.toISOString().substring(0,10)
    let lastEval = data.grades[3].date.toISOString().substring(0,10)
    print(`Dérnière évaluation fais le ${firstEval}`);
    print(`Première évaluation fais le ${lastEval}`)
})

//04 Exercice GPS
//Après avoir créer l'index 2dsphere ci-dessus, trouvez tous les restaurants qui sont à 5 miles autour du point GPS suivant, donnez leurs noms, leur quartier ainsi que les coordonnées GPS en console, aidez-vous des indications ci-après :

//solution 1
const coordinate= [-73.961704, 40.662942];
const distance = 5000 / 0.621371;
db.restaurants.find( 
    {
        "address.coord": {
            $nearSphere: {
               $geometry: {
                  type : "Point",
                  coordinates : coordinate
               },
               $maxDistance: distance
            }
         }    
        
    }
).count()

// solution 2
const query = () => {
    let coordinate= [-73.961704, 40.662942];
    let distanceInMetre = (miles, coef) =>  miles/coef 
        
    db.restaurants.find(
        {
            "address.coord": {
                $nearSphere: {
                   $geometry: {
                      type : "Point",
                      coordinates : coordinate
                   },
                   $maxDistance: distanceInMetre(5000, 0.621371)
                }
             }       
        },
        {_id:0, borough: {$toUpper: "$borough"}, name: {$toUpper: "$name"}, "address.coord":1}
    ).count()
}

//  Exercice Recherche par rapport à la date
// Elle affiche le nom, le quartier et les grades de chaques restaurants dont le grade index 0 = ISODate("2013-12-30T00:00:00Z")

// 06 Exercices supplémentaires
//Affichez la liste des restaurants dont le nom commence et se termine par une voyelle.
db.restaurants.find(
    {
        $and: [
           {name: /^[aeiouy]/i},
           {name: /[aeiouy]$/i}
        ] 
    },
    {_id:0, name: 1}
)

//Affichez la liste des restaurants dont le nom commence et se termine par une même lettre.
db.restaurants.find(
    {
        name: /^(\w).*\1$/i
    },
    {_id:0, name:1}
).count()
