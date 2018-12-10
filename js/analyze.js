function analyze(){
    console.log(targetDemog[0]);
    console.log(randomDemog[0]);


let indexCats = makeIndexCats();
let ageIndexCats = indexCats.age,
    genderIndexCats = indexCats.gender,
    ethnicityIndexCats = indexCats.ethnicity,
    maritalIndexCats = indexCats.marital,
    childrenIndexCats = indexCats.children,
    educationIndexCats = indexCats.education,
    incomeIndexCats = indexCats.income,
    stateIndexCats = indexCats.state
    ;

/* process age data */
const ageIndex0 = indexAttr("age", ageIndexCats, targetDemog, randomDemog);
console.log(ageIndex0);

/* process gender data */
const genderIndex0 = indexAttr("gender", genderIndexCats, targetDemog, randomDemog);
console.log(genderIndex0);

/* process ethnicity data */
const ethnicityIndex0 = indexAttr("ethnicity", ethnicityIndexCats, targetDemog, randomDemog);
console.log(ethnicityIndex0);

/* process marital status data */
const maritalIndex0 = indexAttr("marital", maritalIndexCats, targetDemog, randomDemog);
console.log(maritalIndex0);

/* process number of children data */
const childrenIndex0 = indexAttr("children", childrenIndexCats, targetDemog, randomDemog);
console.log(childrenIndex0);

/* process education data */
const educationIndex0 = indexAttr("education", educationIndexCats, targetDemog, randomDemog);
console.log(educationIndex0);

/* process income data */
const incomeIndex0 = indexAttr("income", incomeIndexCats, targetDemog, randomDemog);
console.log(incomeIndex0);


/* process location data */
const stateIndex0 = indexAttr("state", stateIndexCats, targetDemog, randomDemog);
console.log(stateIndex0);




/* process interests data */
const interestsIndex0 = indexInterestsRetail("interests", targetInterests, randomInterests);
console.log(interestsIndex0);

const interestsIndexTop0 = indexInterestsRetailTop5(interestsIndex0);
console.log(interestsIndexTop0);


/* process retail data */
const retailIndex0 = indexInterestsRetail("retail", targetRetail, randomRetail);
console.log(retailIndex0);

const retailIndexTop0 = indexInterestsRetailTop5(retailIndex0);
console.log(retailIndexTop0);





barChart("age", ageIndex0);
barChart("ethnicity", ethnicityIndex0);
barChart("children", childrenIndex0);
barChart("education", educationIndex0);
barChart("income", incomeIndex0);

pieChart("gender", genderIndex0);
pieChart("marital", maritalIndex0);

mapChart("state", stateIndex0);

hBarChart("interests", interestsIndexTop0);
hBarChart("retail", retailIndexTop0);
};
