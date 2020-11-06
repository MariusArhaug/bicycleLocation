def highestProduct(listA): 
    length = len(listA)
    if length < 3:
        return "List is not big enough to find biggest product of 3 integers!" 
    listA.sort() #ascending order

    #Check if a list only contains negative numbers
    count = 0
    for integer in listA:
        if integer < 0:
            count += 1
    if (count == length):
        return "Cannot find biggest triplet in a list with only"
 
    #find triplet with two biggest negative numbers = positive * biggest positive number
    biggestNegative = listA[0] * listA[1] * listA[length-1]

    #find triplet with three biggest positive numbers
    biggestPositive = listA[length-1] * listA[length-2] * listA[length-3]
   
    finalProduct = max(biggestNegative, biggestPositive)
    return finalProduct

listA = [1,10,2,5,6,3]
print(highestProduct(listA))

listB = [50,20,1,-25,-25,-25]
print(highestProduct(listB))
#print(highestProduct(listB,3))

