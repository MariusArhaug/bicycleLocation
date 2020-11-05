def highestProduct(listA,n):
    listA.sort(reverse=True) #sort in descending order, the three first elements are the biggest
    listA = listA[:n]

    product = 1
    for integer in listA:
        product *= integer
    return product

listA = [1,10,2,6,5,3]
print(highestProduct(listA,3))

