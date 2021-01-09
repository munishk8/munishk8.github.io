# Program to use dictionary methods: keys(), values(), items(), update(), clear()

dic = {                             # Taken a dictionary
    "key1" : "value1",
    "key2" : "value2",
    "key3" : "value3",
}                                           

print(dic.keys())                   # keys() method
print(dic.values())                 # values() method
print(dic.items())                  # items() method

dic.update( {"key4" : "value4"} )   # update() method
print(dic)

dic.clear()                         # clear() method
print(dic)


