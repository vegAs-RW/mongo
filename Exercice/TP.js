// 01. Affichez tous les articles de type journal. Et donnez la quantité total de ces articles (propriété qty). Pensez à faire un script en JS.
let sumQty = 0;
db.inventory.find({
    type: 'journal'
},
{qty: 1, _id: 0, type:1}
).forEach(({qty}) => {
    sumQty += qty
    print(sumQty)
})

db.inventory.aggregate(
    {
      $match: {
        type: "journal"
      }
    }, {
      $group: {_id : null, sumQty: {$sum: '$qty'}}
    }
  )


// 02. Affichez les noms de sociétés depuis 2018 avec leur quantité (sans agrégation)
db.inventory.find(
    { 
        year: { $gte: 2018 } 
    }, { _id: 0, "society": 1, "qty": 1 }
)

// 03. Affichez les types des articles pour les sociétés dont le nom commence par A.
db.inventory.find(
    {
        society: /^A/i
    }, 
    {type:1, _id:0}
).count()

// 04. Affichez le nom des sociétés dont la quantité d'articles est supérieur à 45.
db.inventory.find(
    {
        qty : {$gte: 45}
    },
    {society:1, _id:0}
)

// 05. Affichez le nom des sociétés dont la quantité d'article(s) est strictement supérieur à 45 et inférieur à 90.
db.inventory.find(
    { 
        qty: { $gt: 45, $lt: 90 } 
    }, 
    { _id: 0, society: 1 })

// 06. Affichez le nom des sociétés dont le statut est A ou le type est journal.
db.inventory.find(
    {
        $or: [
            {status: 'A'}, 
            {type: 'journal'}
        ]
    },
    {society: 1, _id:0}
)
// 07. Affichez le nom des sociétés dont le statut est A ou le type est journal et la quantité inférieur strictement à 100.
db.inventory.find(
    {
    $and: [
      { $or: [{ status: "A" }, { type: "journal" }] },
      { qty: { $lt: 100 } }
    ]
  }, { _id: 0, society: 1 }
  )
// 08. Affichez le type des articles qui ont un prix de 0.99 ou 1.99 et qui sont true pour la propriété sale ou ont une quantité strictement inférieur à 45.
db.inventory.find(
    {
         $and: [
            {$or: [{ price: 0.99 }, { price: 1.99 }] },
            {sale: true}  
         ],
         $or: [
            {qty: {$lt: 45}}
         ]
    },
    {type:1, _id:0}
)
// 09. Affichez le nom des sociétés et leur(s) tag(s) si et seulement si ces sociétés ont au moins un tag.
db.inventory.find(
    { 
        tags: { $exists: true, $not: { $size: 0 } } 
    }, 
    { _id: 0, society: 1, tags: 1 }
)
// 10. Affichez le nom des sociétés qui ont au moins un tag blank.
db.inventory.find(
    {
        tags: /blank/i
    },
    {society: 1, _id:0}
)

// 11. Affichez le nom des sociétés qui ont 3 tags blanks uniquement.
//let res = []
db.inventory.find({
  tags : "blank"
}, 
{_id: 0, society: 1, tags: 1}
).forEach(({tags, society})=>{
    let count = 0 ;
    for(const tag of tags){
        if( tag === 'blank') count+=1 ;  
    }
    if(count == 3) {res.push({tags, society}) }
});

print(res)

// 
function searchTag({ max, tag}){
    let res = [];
    db.inventory.find({
        tags : "blank"
        }, 
        {_id: 0, society: 1, tags: 1}
    ).forEach(({tags, society})=>{
        let count = 0 ;
        for(const t of tags) if( t === tag ) count+=1 ;
        if(count == max) res.push({tags, society});
    });
        
    return res;
}

print(searchTag( { max : 3, tag : 'blank' } ));

// Approche fonctionnelle dans le find, avec le tag expr
db.inventory.find({tags: "blank", $expr: { $function: {
    body: function(tags, society){
        let [res, count] = [[], 0]; // initialisation des variables
        for(const tag of tags) if( tag === 'blank' ) count+=1 ;
        if(count == 3) {
            res.push({tags, society});

            return res;
        }
        
    },
    args: ["$tags", "$society"],
    lang: "js"
}}}, { tags : 1, _id : 0, society: 1})

// 02 Exercice faire une augmentation de 50% & 150%
// 50%
db.inventory.updateMany(
    {
        $or: [
            {status: 'C'},
            {status: 'D'}
        ]
    },
    {$mul: {qty: 1.5}}
)
db.inventory.find(
    {
        $and : [
            {$or: [{status: 'A'}, {status: 'B'}]},
            {tags: ['blank', 'blank', 'blank']}
        ]
    },
    {_id: 0, society: 1, qty: 1}
)

// 150%
db.inventory.updateMany(
    {
        $and : [
            {$or: [{status: 'A'}, {status: 'B'}]},
            {tags: {$all: ['blank', 'blank', 'blank']}}
        ]
        
    },
    {$mul: {qty: 2.5}}
)


/* 03 Exercice ajouter un champ et calculer
Dans cet exercice vous pouvez utiliser updateMany pour insérer un nouveau champ.

-Ajoutez un champ scores de type array avec le score 19 pour les entreprises ayant une qty supérieure ou égale à 75.
-Puis mettre à jour les entreprises ayant au moins une lettre a ou A dans leurs noms de société et ajouter leur un score 11 (champ scores).
-Affichez les docs qui ont un score de 11
-Ajoutez une clé comment pour les sociétés Alex et ajouter un commentaire : "Hello Alex".
-Affichez maintenant tous les docs qui n'ont pas la clé comment.*/

// 1
db.inventory.updateMany(
    { qty: {$gt: 75} },
    {
      $set: { "scores": [19]},
      $currentDate: { lastModified: true }
    }
 )

 db.inventory.updateMany(
    { qty: {$gt: 75} },
    {
        $push: { scores: 19},
      $currentDate: { lastModified: true }
    }
 )

 db.inventory.find({
     qty: {$gt: 75} 
 },
 )

 // 2
 db.inventory.updateMany(
    {
        society: /a/i
    },
    {
        $set: {"scores": [11]},
        $currentDate: { lastModified: true }
    }, 
    {"upsert": true}
 )

 // 3
 db.inventory.find(
    {
        scores: 11
    },
    {_id: 0, society: 1}
 )

 // 4 
 db.inventory.updateMany(
    {
        society: 'Alex'
    },
    {
        $set: {"comment": "Hello Alex"},
        $currentDate: { lastModified: true }
    },
 )

 // 5 
 db.inventory.find(
    {
        comment: { $exists: false } 
    },
    {_id:0, society:1}
 )

 // 04 Exercice suppression d'un champ

 db.inventory.find(
    {
        level: { $exists: true } 
    },
    {_id:0, society:1}
 )

 db.inventory.updateOne(
    {
    society: "Nel"
    },
    {$unset: {level: ""}},
    {'upsert': false}
 )

 db.inventory.findOne(
    {
        society: "Nel"
    }
 )




 //
 db.inventory.updateMany(
    {
        qty: {$gt: 75}
    },
    {$unset: {scores: "", score: ""}},
    {'upsert': false}
 )



 db.restaurants.aggregate([
    {$match : { borough : "Brooklyn"}},
    {
        $addFields: {
            gradeA:
            {
                $function:
                {
                    body: function (grades) {
                        const gradeA = grades.filter(g => g.grade === 'A').map(g => 1)

                        return Array.sum(gradeA)
                    },
                    args: ["$grades"],
                    lang: "js"
                }
            }
        }
    },
    { $project: { gradeA: 1, borough: 1, name: 1, _id: 0, address : 1 } },
    { $group : { _id : "$gradeA", names: { $push: { name : "$name" , address : "$address"} } } },
    { $sort : { gradeA : -1 } },
    { $limit : 1}
]);



 // Filtre les restaurants du quartier de Brooklyn
 // ajoutez un champ gradeA et y ajouter la somme du nombre de grade A de chaque restaurant
 // Remodelez le document pour afficher uniquement le gradeA, le quartier, le nom et l'adresse
 // modifier le document pour qu'il n'y ai que l'id qui vaut le 'gradeA', l'adresse et le nom
 // Trier la collection par ordre decroissant de la valeur gradeA
 // Renvoyer le premier document du pipeline



//                     ************ Aggregation ***************

// Calculer le total des quantités par société
db.inventory.aggregate(
    [
        {$group: {
            _id : "$society", 
            sumQty: {$sum: '$qty'}
        }}
    ]
)

// Récuperer le total superieur ou égal à 75 par société
db.inventory.aggregate(
    [
        {$group: {
            _id: "$society",
            total: {$sum: "$qty"}
        }},
        {$match : {total: {$gte: 75}}},
    ]
)

/* Grâce à un pipeline d'aggregation, récupérez les document de la collection restaurants qui ont au moins un grade "A", de cuisine American, et générez également :

un nouveau champs fullAddress qui sera la combinaison des champs address.building, address.street et address.zipcode
un nouveau champs fullname qui sera la combinaison de name et de borough (la valeur de $borough devra être en MAJUSCULES) */

// Le résultat final devrait ressembler à ceci :

{
    fullname: "Brunos On The Boulevard (QUEENS)",
    fullAddress: "8825 Astoria Boulevard, 11369",
    cuisine: "American",
    grades: [ … ] // avec au moins un type 'A'
}
// … etc

db.restaurants.aggregate(
    [
        {$match: {
            cuisine: 'American',
            'grades.grade' : 'A'
        }},
        // On met dasn le $project ce que l'on veux afficher ici on crée un nouveau champ "fullAddress" qui n'ecrase en rien la collection
        {$project: {
            fullAddress: {
                $concat: [
                    "$address.building",
                    " ",
                    "$address.street",
                    ", ",
                    "$address.zipcode"
                ] 
            },
            fullname: {
                $concat: [
                    "$name",
                    " ",
                    "(",
                    {$toUpper: "$borough"},
                    ")"
                ] 
            } 
            ,
             "cuisine": 1, "grades": 1, "_id": 0
        }},   
    ]
)


// 01 Exercice calculer la somme par agence collection sales
//
db.sales.aggregate( [
    {
      $group: {
         _id: "$agency",
         count: { $sum: "$price" }
      }
    }
  ] )

//
db.sales.aggregate( [
    {
      $group: {
         _id: "$agency",
         count: { $sum: "$price" }
      },
      
    },
    {$match: {
        "count": {$gt: 950000}
      }}
  ] )

// 02 Exercice collections Restaurants

// On aimerait maintenant avoir tous les noms et id des restaurants par type de cuisine et quartier. Limitez l'affichage à deux résultats.

db.restaurants.aggregate([
    {$group: {
        _id: {cuisine: "$cuisine", borough: "$borough" },
        names: {$push: {name: "$name", restaurant: "$restaurant_id"}}
    }},
    {$limit: 2}
])


//Affichez maintenant tous les noms de restaurant Italiens par quartier.
db.restaurants.aggregate([
    {$match: {
        cuisine: 'Italian',
    }},
    {$group: {
        _id: "$borough",
        names: {$push: {$concat:["$name", " ", "id: ","$restaurant_id"]}}
    }},
    {$project: {
        names:1
    }}
])



// Affichez également, pour chaque restaurant, la moyenne de ses scores. Et ordonnez vos résultats par ordre de moyenne décroissante.
db.restaurants.aggregate([
    { $unwind : "$grades" } ,
    {$group: {
        _id: "$name",
        names: {$push: {$concat:["$name", " ", "id: ","$restaurant_id"]}},
        moyenne: {$avg: "$grades.score"}
    }},
    {$sort: {moyenne: -1}}
])

// Faites une requête qui récupère les 5 premiers restaurants Italiens les mieux notés et placez cette recherche dans une collection nommée top5.
db.restaurants.aggregate([
    {$match: {
        cuisine: 'Italian'
    }},
    {$unwind : "$grades"},
    {$project: {
        name: 1,
        avg: {$avg: "$grades.score"},
        _id: 0
    }},
    {$sort: {avg: -1}},
    {$limit:5},
    {$out: "top5"}
])


//  Récupérez le nombre de restaurants par quartier ainsi que leur type de cuisine qui contiennent AU MOINS un score supérieur ou égal à 30. Ordonnez le résultat par ordre décroissant de nombre de restaurant.
db.restaurants.aggregate([
    {$match: {
        "grades.score": {$gte: 30}
    }},
    {$group: {
        _id: {cuisine: "$cuisine", borough: "$borough"},
        sumResto: {$sum: 1}  
    }},
    {$sort: {sumResto: -1}},
])

// Cherchez les meilleurs restaurants en proposant une requête de votre choix, faites le par quartier. Puis donnez la moyenne des scores de ces restaurants.
db.restaurants.aggregate([
    { $unwind : "$grades" } ,
    { $project: {
        _id: 0,
        name: 1,
        avg: { $avg: "$grades.score" },
        borough: 1
    }},
    { $sort: { avg: -1 } },
])

// Cherhcer le nombre de grade A par restaurant
db.restaurants.aggregate([
    {
        $addFields: {
            gradeA: {
                $function:{
                    body: function(grades){

                        return grades.filter(g => g.grade === "A" ).length
                    },
                    args: ["$grades"],
                    lang: "js"
                }
            }
        }
    },
    { $project: { gradeA: 1, name: 1, _id: 0, name: 1}},
    { $group: { _id: "$gradeA", name: { $push : "$name" }  }},
    { $sort: { gradeA: -1 } },
    { $limit: 1 },
])