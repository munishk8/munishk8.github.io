# Program to use the list methods: append(), count(), extend(), index()

ls = ["a","b","c","d"]                          # Taken a list

print("List is: ", ls)                          # Print the list
print("Count number of 'a': ", ls.count('a'))   # count() method
print("Index of 'c': ", ls.index("c"))          # index() method

ls.append("e")                                  # append() method
print("List after append: ", ls)

ls.extend(["f","g","h"])                        # extend() method
print("List after extend: ", ls)                



