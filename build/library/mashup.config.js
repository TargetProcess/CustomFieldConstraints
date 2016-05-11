tau.mashups.addModule("CustomFieldConstraints/config", [
    {
        "constraints": {
            "requester": {
                "customFields": [
                    {
                        "name": "Age",
                        "requiredCustomFields": [
                            "Height"
                        ]
                    }
                ]
            }
        }
    }
]);