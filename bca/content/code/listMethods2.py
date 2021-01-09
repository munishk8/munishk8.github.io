# Program to use the list methods: insert(), pop(), remove(), reverse(), sort()

ls = ["d","b","a","e"]                  # Taken a list

print("List is: ", ls)                  # Print the list

ls.insert(2,'c')
print("List after Inserting 'c': ", ls) # insert() method
ls.sort()
print("List after Sorting: ", ls)       # sort() method
ls.reverse()
print("List after Reversing: ", ls)     # reverse() method
ls.remove('e')
print("List after removing 'e': ", ls)  # remove() method
ls.pop()
print("List after pop : ", ls)          # pop() method



