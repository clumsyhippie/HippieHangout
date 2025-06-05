with open("growiNames.txt", "r") as a:
    all_names = a.read().lower()
    
with open("growiNew.txt", "r") as n:
    new_name = n.read().lower()

with open("growiResult.txt", "w+") as f:
    f.write(str(f";{new_name}" not in all_names and f"{new_name};" not in all_names).lower())

if new_name not in all_names:
    with open("growiNames.txt", "w+") as f:
        f.write(f"{all_names}{new_name};".lower())    