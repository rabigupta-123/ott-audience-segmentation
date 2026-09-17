import pandas as pd
import json
import os

def inspect_dataset(csv_path="data/ott_viewer_activity.csv"):
    if not os.path.exists(csv_path):
        print(f"Error: dataset file '{csv_path}' not found.")
        return None

    df = pd.read_csv(csv_path)

    stats = {
        "num_rows": int(len(df)),
        "num_cols": int(df.shape[1]),
        "column_names": list(df.columns),
        "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing_value_counts": {col: int(count) for col, count in df.isnull().sum().items()},
        "duplicate_count": int(df.duplicated(subset=["user_id"]).sum()),
        "numerical_stats": df.describe().to_dict()
    }

    # Analyze genre frequencies
    all_genres = []
    for g_str in df['top_genres'].dropna():
        genres = [g.strip() for g in str(g_str).split(',') if g.strip()]
        all_genres.extend(genres)
    
    stats["genre_distribution"] = dict(pd.Series(all_genres).value_counts())

    print("=========================================")
    print("      AUDIENCEIQ DATASET INSPECTION      ")
    print("=========================================")
    print(f"Rows: {stats['num_rows']}, Columns: {stats['num_cols']}")
    print(f"Duplicates: {stats['duplicate_count']}")
    print(f"Missing Values: {stats['missing_value_counts']}")
    print("Numerical Summary:")
    for col, s in stats["numerical_stats"].items():
        print(f"  - {col}: min={s['min']:.1f}, mean={s['mean']:.1f}, max={s['max']:.1f}")
    print("Genre Frequencies:")
    for g, count in stats["genre_distribution"].items():
        print(f"  - {g}: {count}")
    print("=========================================")

    return stats

if __name__ == "__main__":
    inspect_dataset()
