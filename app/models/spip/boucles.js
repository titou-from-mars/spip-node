/**
 * On peut imaginer que cet objet soit construit en fonction de la configuration de spip, en lisant la table spip_meta
 */
module.exports = {   
    article:{       
        jointures:{
            id_mot:"mot",
            id_auteur:"auteur",
            id_document:"document"
        },
        table:"spip_articles",
        table_jointures:null,        
        nom:"article",
        id:"id_article", 
        maj:true
    },
    rubrique:{       
        jointures:{
            id_mot:"mot",
            id_auteur:"auteur",
            id_document:"document"
        },
        table:"spip_rubriques",
        table_jointures:null,        
        nom:"rubrique",
        id:"id_rubrique", 
        maj:true
    },
    mot:{
        table:"spip_mots",
        table_jointures:"spip_mots_liens",       
        nom:"mot",
        id:"id_mot",       
        jointures:null,
        maj:true        
    },
    document:{
        table:"spip_documents",
        table_jointures:"spip_documents_liens",       
        nom:"document",
        id:"id_document",       
        jointures:null,
        maj:true        
    },
    auteur:{
        table:"spip_auteurs",
        table_jointures:"spip_auteurs_liens",       
        nom:"auteur",
        id:"id_auteur",       
        jointures:null,
        maj:true 

    },
    breve:{ 
        table:"spip_breves",       
        jointures:{
            id_mot:"mot",
            id_auteur:"auteur",
            id_document:"document"
        },
        table_jointures:null,        
        nom:"breve",
        id:"id_breve",
        maj:true
    }
}