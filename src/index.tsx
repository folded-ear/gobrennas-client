import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTreeData } from "react-stately";
import {
    Button,
    defaultTheme,
    Item,
    ListBox,
    Provider,
    Section,
    Text,
} from "@adobe/react-spectrum";
import { hash } from "ohash";

type Database = Record<string, string | null>;

interface ItemValue {
    name: string;
    kids?: Array<ItemValue>;
}

const INITIAL_ITEMS: Database = {
    People: null,
    David: "People",
    Sam: "People",
    Jane: "People",
    Animals: null,
    Aardvark: "Animals",
    Kangaroo: "Animals",
    Snake: "Animals",
};
const STORAGE_KEY = "my-nifty-tree";

function select(): Database {
    const json = localStorage.getItem(STORAGE_KEY);
    try {
        if (json) return JSON.parse(json);
    } catch (e) {
        console.error("Failed to parse", json);
    }
    return INITIAL_ITEMS;
}

function update(value: Database) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function useDb(label): [Database, (v: Database) => void] {
    const [db, setDb] = useState(select);
    useEffect(() => {
        // poll for updates
        const interval = setInterval(() => {
            const next = select();
            console.log(label, "hash check", hash(next), hash(db));
            if (hash(next) !== hash(db)) {
                setDb(next);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [label, db]);
    return [db, update];
}

function Tree({ label }) {
    const [db, setDb] = useDb(label);
    const dbhash = useMemo(() => hash(db), [db]);
    console.log(label, "db", dbhash);
    const [roots, index] = useMemo(() => {
        const roots: ItemValue[] = [];
        const index = new Map<string, ItemValue>();
        for (const key in db) {
            const item = { name: key, kids: [] };
            index.set(key, item);
            const parent = db[key];
            if (parent) {
                index.get(parent)!.kids!.push(item);
            } else {
                roots.push(item);
            }
        }
        return [roots, index];
    }, [dbhash]);

    console.log(label, "db", db);
    console.log(label, "roots", roots);

    const tree = useTreeData<ItemValue>({
        initialItems: roots,
        getKey: (item) => item.name,
        getChildren: (item) => item.kids ?? [],
    });

    const handleAdd = (key) => {
        const name = prompt("Name?");
        if (name) {
            tree.insertAfter(key, { name });
            setDb({
                ...db,
                [name]: db[key],
            });
        }
    };

    return (
        <>
            <h1>{label}</h1>
            <ListBox aria-label="List organisms" items={tree.items}>
                {(node) => {
                    console.log("render", node.key);
                    return (
                        <Section title={node.value.name} items={node.children}>
                            {(node) => {
                                console.log("render", node.key);
                                return (
                                    <Item>
                                        <div
                                            style={{
                                                display: "flex",
                                            }}
                                        >
                                            {node.value.name}
                                            <Button
                                                variant="primary"
                                                onPress={() =>
                                                    handleAdd(node.key)
                                                }
                                            >
                                                <Text>Add</Text>
                                            </Button>
                                        </div>
                                    </Item>
                                );
                            }}
                        </Section>
                    );
                }}
            </ListBox>
        </>
    );
}

function Trees() {
    console.log("TREES");

    return (
        <Provider theme={defaultTheme}>
            <div style={{ display: "flex" }}>
                <div
                    style={{
                        flex: 1,
                    }}
                >
                    <Tree label={"Left"} />
                </div>
                <div
                    style={{
                        flex: 1,
                    }}
                >
                    <Tree label={"Right"} />
                </div>
            </div>
        </Provider>
    );
}

createRoot(document.getElementById("root")!).render(<Trees />);
